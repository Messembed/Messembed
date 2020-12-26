import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { MessagesRepository } from './repositories/messages.repository';
import { CreateMessageOptions } from './interfaces/create-message-options.interface';
import { CreateMessageInMongoOptions } from './interfaces/create-message-in-mongo-options.interface';
import { Message } from './entities/message.entity';
import { GetMessagesFiltersDto } from './dto/get-messages-filters.dto';
import _ from 'lodash';
import { MoreThan, LessThan, Not } from 'typeorm';
import { ChatsRepository } from '../chats/repositories/chats.repository';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { PaginatedMessagesDto } from './dto/paginated-messages.dto';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import { ChatsService } from '../chats/chats.service';
import { UnreadMessagesCountPerChat } from './interfaces/unread-messages-count-per-chat.interface';
import { MessageMongo, MessageMongoDocument } from './schemas/message.schema';
import { Model, Types } from 'mongoose';
import { PaginatedMessagesFromMongoDto } from './dto/paginated-messages-from-mongo.dto';
import { GetMessagesFromMongoFiltersDto } from './dto/get-messages-from-mongo-filters.dto';
import { Condition } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepo: MessagesRepository,
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService,
    private readonly chatsRepo: ChatsRepository,
    @InjectModel(MessageMongo.name)
    private readonly messageModel: Model<MessageMongoDocument>,
  ) {}

  @Transactional()
  async createMessage(options: CreateMessageOptions): Promise<Message> {
    await this.chatsService.findChatByIdAndCompanionOrFailHttp(
      options.chatId,
      options.userId,
    );

    const msg = new Message(options);

    await this.messagesRepo.save(msg);

    await this.readMessagesAsUser(options.chatId, options.userId);

    await this.chatsRepo.update(options.chatId, {
      lastMessageId: msg.id,
    });

    return msg;
  }

  async createMessageInMongo(
    options: CreateMessageInMongoOptions,
  ): Promise<MessageMongoDocument> {
    await this.chatsService.findChatByIdAndCompanionInMongoOrFailHttp(
      options.chatId,
      options.userId,
    );

    const message = await this.messageModel.create({
      createdAt: new Date(),
      chat: options.chatId,
      user: options.userId,
      content: options.content,
      read: false,
      externalMetadata: options.externalMetadata,
      privateExternalMetadata: options.privateExternalMetadata,
    });

    // TODO: read messages of companion

    await this.chatsService.setLastMessageOfChat(options.chatId, message);

    return message;
  }

  async getPaginatedMessagesConsideringAccessRights(
    authData: RequestAuthData,
    chatId: number,
    filters?: GetMessagesFiltersDto,
  ): Promise<PaginatedMessagesDto> {
    const chat = await this.chatsService.getChatConsideringAccessRights(
      chatId,
      authData,
    );

    return this.getPaginatedMessages(chat.id, filters);
  }

  async getPaginatedMessagesFromMongoConsideringAccessRights(
    authData: RequestAuthData,
    chatId: Types.ObjectId,
    filters?: GetMessagesFiltersDto,
  ): Promise<PaginatedMessagesFromMongoDto> {
    const chat = await this.chatsService.getChatFromMongoConsideringAccessRights(
      chatId,
      authData,
    );

    return this.getPaginatedMessagesFromMongo(chat._id, filters);
  }

  async getPaginatedMessages(
    chatId: number,
    filters?: GetMessagesFiltersDto,
  ): Promise<PaginatedMessagesDto> {
    const messages = await this.getMessages(chatId, filters);

    return new PaginatedMessagesDto({
      ...filters,
      messages,
    });
  }

  async getPaginatedMessagesFromMongo(
    chatId: Types.ObjectId,
    filters?: GetMessagesFiltersDto,
  ): Promise<PaginatedMessagesFromMongoDto> {
    const messages = await this.getMessagesFromMongo(chatId, filters);

    return new PaginatedMessagesFromMongoDto({
      ...filters,
      messages,
    });
  }

  async getMessages(
    chatId: number,
    filters?: GetMessagesFiltersDto,
  ): Promise<Message[]> {
    const idFilters = !_.isNil(filters?.afterId)
      ? MoreThan(filters?.afterId)
      : !_.isNil(filters?.beforeId)
      ? LessThan(filters?.beforeId)
      : undefined;

    const messages = await this.messagesRepo.find({
      where: {
        chatId,
        ...(idFilters ? { id: idFilters } : {}),
      },
      order: {
        id: 'ASC',
      },
      skip: filters?.offset || undefined,
      take: filters?.limit || undefined,
    });

    return messages;
  }

  async getMessagesFromMongo(
    chatId: Types.ObjectId,
    filters?: GetMessagesFromMongoFiltersDto,
  ): Promise<MessageMongoDocument[]> {
    const createdAtCondition: Condition<Date> = !_.isNil(filters?.after)
      ? { $gte: filters?.after }
      : !_.isNil(filters?.before)
      ? { $lt: filters?.before }
      : undefined;

    const messagesQuery = this.messageModel
      .find({
        chat: chatId,
        ...(createdAtCondition ? { createdAt: createdAtCondition } : {}),
      })
      .sort({ createdAt: 'ASC' });

    if (filters?.offset) {
      messagesQuery.skip(filters?.offset);
    }

    if (filters?.limit) {
      messagesQuery.limit(filters?.limit);
    }

    const messages = await messagesQuery.exec();

    return messages;
  }

  async getUnreadMessagesCountPerChatForUser(
    userId: string,
  ): Promise<UnreadMessagesCountPerChat> {
    const unreadMessagesCountPerChat = await this.messagesRepo
      .createQueryBuilder('messages')
      .select([
        'messages.chatId as "chatId"',
        'COUNT(messages.id) as "unreadCount"',
      ])
      .where('messages.userId <> :currentUserId', { currentUserId: userId })
      .andWhere('messages.read = False')
      .groupBy('messages.chatId')
      .getRawMany<{ chatId: number; unreadCount: number }>();

    return unreadMessagesCountPerChat.reduce<UnreadMessagesCountPerChat>(
      (acc, unreadCountPerChat) => {
        acc[unreadCountPerChat.chatId] = unreadCountPerChat.unreadCount;
        return acc;
      },
      {},
    );
  }

  async getUnreadMessageCountOfChatForUser(
    userId: string,
    chatId: number,
  ): Promise<number> {
    return await this.messagesRepo
      .createQueryBuilder('messages')
      .where('messages.userId <> :currentUserId', { currentUserId: userId })
      .andWhere('messages.read = False')
      .andWhere('messages.chatId = :chatId', {
        chatId,
      })
      .getCount();
  }

  async readMessagesAsUser(chatId: number, userId: string): Promise<void> {
    await this.messagesRepo.update(
      {
        chatId: chatId,
        userId: Not(userId),
        read: false,
      },
      { read: true },
    );
  }
}

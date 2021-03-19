import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateMessageInMongoOptions } from './interfaces/create-message-in-mongo-options.interface';
import _ from 'lodash';
import { ChatsService } from '../chats/chats.service';
import { MessageMongo, MessageMongoDocument } from './schemas/message.schema';
import { Model, Types } from 'mongoose';
import { PaginatedMessagesFromMongoDto } from './dto/paginated-messages-from-mongo.dto';
import { GetMessagesFromMongoFiltersDto } from './dto/get-messages-from-mongo-filters.dto';
import { MessageForFrontend } from './dto/message-for-frontend.dto';
import { MarkMessageAsReadThroughWebSocketDto } from './dto/mark-message-as-read-through-websocket.dto';
import { Condition } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { UpdatesService } from '../updates/updates.service';
import { ChatMongoDocument } from '../chats/schemas/chat.schema';
import { PaginatedMessagesForAdminDto } from './dto/paginated-messages-for-admin.dto';
import { ErrorGenerator } from '../common/classes/error-generator.class';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService,
    @Inject(forwardRef(() => UpdatesService))
    private readonly updatesService: UpdatesService,
    @InjectModel(MessageMongo.name)
    private readonly messageModel: Model<MessageMongoDocument>,
  ) {}

  async createMessage(
    options: CreateMessageInMongoOptions,
  ): Promise<MessageMongoDocument> {
    const chat = await this.chatsService.getChatByIdAndCompanionOrFailHttp(
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

    await this.updatesService.createUpdate({
      chatId: options.chatId,
      type: 'new_message',
      message,
    });

    await this.chatsService.incrementNotReadMessagesCountAndReadCompanionsMessages(
      chat._id,
      chat.firstCompanion._id === options.userId ? 1 : 2,
    );
    await this.chatsService.setLastMessageOfChat(options.chatId, message);

    return message;
  }

  async getPaginatedMessagesForUser(
    currentUserId: string,
    chatId: Types.ObjectId,
    filters?: GetMessagesFromMongoFiltersDto,
  ): Promise<PaginatedMessagesFromMongoDto> {
    await this.chatsService.getChatByIdAndCompanionOrFailHttp(
      chatId,
      currentUserId,
    );

    const messages = await this.getMessagesByChatId(chatId, filters);

    const messagesForFrontend = MessageForFrontend.fromMessages(
      messages,
      currentUserId,
    );

    return new PaginatedMessagesFromMongoDto({
      ...filters,
      messages: messagesForFrontend,
    });
  }

  async getPaginatedMessagesForAdmin(
    chatId: Types.ObjectId,
    filters?: GetMessagesFromMongoFiltersDto,
  ): Promise<PaginatedMessagesForAdminDto> {
    const chat = await this.chatsService.getChatByIdOrFailHttp(chatId);

    const messages = await this.getMessagesByChatId(chat._id, filters);

    return new PaginatedMessagesForAdminDto({
      ...filters,
      messages,
    });
  }

  async getMessagesByChatId(
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
        ...(!_.isNil(filters.read) ? { read: filters.read } : {}),
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

  async markMessageAsReadConsideringAccessRights(
    currentUserId: string,
    params: MarkMessageAsReadThroughWebSocketDto,
  ): Promise<{ chat: ChatMongoDocument }> {
    const chat = await this.chatsService.getChatByIdAndCompanionOrFailHttp(
      Types.ObjectId.createFromHexString(params.chatId),
      currentUserId,
    );

    if (!chat) {
      throw ErrorGenerator.create('CHAT_NOT_FOUND');
    }

    await this.messageModel.updateOne(
      {
        chat: chat.id,
        _id: params.messageId,
        // Current user can't mark his own messages as read. You can do that only with messages
        // of your companion.
        user: { $ne: currentUserId },
      },
      {
        $set: {
          read: true,
        },
      },
    );

    return { chat };
  }

  async getAllMessagesForAdminWrapped(
    filters?: GetMessagesFromMongoFiltersDto,
  ): Promise<PaginatedMessagesFromMongoDto> {
    const messages = await this.getAllMessagesForAdmin(filters);

    const messagesForFrontend = MessageForFrontend.fromMessages(messages);

    return new PaginatedMessagesFromMongoDto({
      ...filters,
      messages: messagesForFrontend,
    });
  }

  async getAllMessagesForAdmin(
    filters?: GetMessagesFromMongoFiltersDto,
  ): Promise<MessageMongoDocument[]> {
    const createdAtCondition: Condition<Date> = !_.isNil(filters?.after)
      ? { $gte: filters?.after }
      : !_.isNil(filters?.before)
      ? { $lt: filters?.before }
      : undefined;

    const messagesQuery = this.messageModel
      .find({
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
}

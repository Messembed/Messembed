import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateMessageInMongoOptions } from './interfaces/create-message-in-mongo-options.interface';
import _ from 'lodash';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import { ChatsService } from '../chats/chats.service';
import { MessageMongo, MessageMongoDocument } from './schemas/message.schema';
import { Model, Types } from 'mongoose';
import { PaginatedMessagesFromMongoDto } from './dto/paginated-messages-from-mongo.dto';
import { GetMessagesFromMongoFiltersDto } from './dto/get-messages-from-mongo-filters.dto';
import { MessageForFrontend } from './dto/message-for-frontend.dto';
import { Condition } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { UpdatesService } from '../updates/updates.service';

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

  async createMessageInMongo(
    options: CreateMessageInMongoOptions,
  ): Promise<MessageMongoDocument> {
    const chat = await this.chatsService.findChatByIdAndCompanionInMongoOrFailHttp(
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

  async getPaginatedMessagesFromMongoConsideringAccessRights(
    authData: RequestAuthData,
    chatId: Types.ObjectId,
    filters?: GetMessagesFromMongoFiltersDto,
  ): Promise<PaginatedMessagesFromMongoDto> {
    const chat = await this.chatsService.getChatFromMongoConsideringAccessRights(
      chatId,
      authData,
    );

    return this.getPaginatedMessagesFromMongo(
      chat._id,
      filters,
      authData.user && authData.user._id,
    );
  }

  async getPaginatedMessagesFromMongo(
    chatId: Types.ObjectId,
    filters?: GetMessagesFromMongoFiltersDto,
    currentUserId?: string,
  ): Promise<PaginatedMessagesFromMongoDto> {
    const messages = await this.getMessagesFromMongo(chatId, filters);

    const messagesForFrontend = MessageForFrontend.fromMessages(
      messages,
      currentUserId,
    );

    return new PaginatedMessagesFromMongoDto({
      ...filters,
      messages: messagesForFrontend,
    });
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
}

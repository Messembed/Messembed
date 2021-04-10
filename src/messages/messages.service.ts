import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateMessageParams } from './interfaces/create-message-params.interface';
import _ from 'lodash';
import { ChatsService } from '../chats/chats.service';
import { MessageModel, MessageDocument } from './schemas/message.schema';
import { Model, Types } from 'mongoose';
import { PaginatedMessagesDto } from './dto/paginated-messages.dto';
import { GetMessagesFiltersDto } from './dto/get-messages-filters.dto';
import { MessageForFrontend } from './dto/message-for-frontend.dto';
import { MarkMessageAsReadThroughWebSocketDto } from './dto/mark-message-as-read-through-websocket.dto';
import { Condition } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { UpdatesService } from '../updates/updates.service';
import { ChatDocument } from '../chats/schemas/chat.schema';
import { PaginatedMessagesForAdminDto } from './dto/paginated-messages-for-admin.dto';
import { ErrorGenerator } from '../common/classes/error-generator.class';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService,
    @Inject(forwardRef(() => UpdatesService))
    private readonly updatesService: UpdatesService,
    @InjectModel(MessageModel.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async getLatestMatchingMessageInChatsOfUser(
    userId: string,
    query: string,
  ): Promise<{ [chatId: string]: MessageDocument }> {
    const chatIds = await this.chatsService.listIdsOfChatsOfUser(userId);

    const plainMessages: any[] = await this.messageModel
      .aggregate([
        {
          $match: {
            chat: { $in: chatIds },
            $text: { $search: query },
          },
        },
        {
          $sort: { createdAt: 1 },
        },
        {
          $group: {
            _id: '$chat',
            lastId: { $last: '$_id' },
            createdAt: { $last: '$createdAt' },
            updatedAt: { $last: '$updatedAt' },
            deletedAt: { $last: '$deletedAt' },
            editedAt: { $last: '$editedAt' },
            user: { $last: '$user' },
            content: { $last: '$content' },
            read: { $last: '$read' },
            externalMetadata: { $last: '$externalMetadata' },
            privateExternalMetadata: { $last: '$privateExternalMetadata' },
          },
        },
        {
          $project: {
            _id: '$lastId',
            chat: '$_id',
            createdAt: 1,
            updatedAt: 1,
            deletedAt: 1,
            editedAt: 1,
            user: 1,
            content: 1,
            read: 1,
            externalMetadata: 1,
            privateExternalMetadata: 1,
          },
        },
      ])
      .exec();

    const chatToLatestMatchingMessageMapping: {
      [chatId: string]: MessageDocument;
    } = {};

    plainMessages.forEach(plainMessage => {
      const message = this.messageModel.hydrate(plainMessage);
      chatToLatestMatchingMessageMapping[message.chat.toHexString()] = message;
    });

    return chatToLatestMatchingMessageMapping;
  }

  async createMessage(options: CreateMessageParams): Promise<MessageDocument> {
    const chat = await this.chatsService.getChatByIdAndCompanionOrFailHttp(
      options.chatId,
      options.userId,
    );

    if (!chat.active) {
      throw ErrorGenerator.create(
        'CHAT_IS_INACTIVE',
        `Chat with ID ${options.chatId} is inactive.`,
      );
    }

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
    filters?: GetMessagesFiltersDto,
  ): Promise<PaginatedMessagesDto> {
    await this.chatsService.getChatByIdAndCompanionOrFailHttp(
      chatId,
      currentUserId,
    );

    const messages = await this.getMessagesByChatId(chatId, filters);

    const messagesForFrontend = MessageForFrontend.fromMessages(
      messages,
      currentUserId,
    );

    return new PaginatedMessagesDto({
      ...filters,
      messages: messagesForFrontend,
    });
  }

  async getPaginatedMessagesForAdmin(
    chatId: Types.ObjectId,
    filters?: GetMessagesFiltersDto,
  ): Promise<PaginatedMessagesForAdminDto> {
    const chat = await this.chatsService.getChatByIdOrCompanionsIdsOrFailHttp(
      chatId,
    );

    const messages = await this.getMessagesByChatId(chat._id, filters);

    return new PaginatedMessagesForAdminDto({
      ...filters,
      messages,
    });
  }

  async getMessagesByChatId(
    chatId: Types.ObjectId,
    filters?: GetMessagesFiltersDto,
  ): Promise<MessageDocument[]> {
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
  ): Promise<{ chat: ChatDocument }> {
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
    filters?: GetMessagesFiltersDto,
  ): Promise<PaginatedMessagesDto> {
    const messages = await this.getAllMessagesForAdmin(filters);

    const messagesForFrontend = MessageForFrontend.fromMessages(messages);

    return new PaginatedMessagesDto({
      ...filters,
      messages: messagesForFrontend,
    });
  }

  async getAllMessagesForAdmin(
    filters?: GetMessagesFiltersDto,
  ): Promise<MessageDocument[]> {
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

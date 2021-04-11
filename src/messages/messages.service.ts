import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateMessageParams } from './interfaces/create-message-params.interface';
import _ from 'lodash';
import { ChatsService } from '../chats/chats.service';
import { MessageModel, MessageDocument } from './schemas/message.schema';
import { FilterQuery, Model, Types } from 'mongoose';
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
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService,
    @Inject(forwardRef(() => UpdatesService))
    private readonly updatesService: UpdatesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @InjectModel(MessageModel.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async listMessagesWithAttachments(
    currentUser: UserDocument,
    chatId: Types.ObjectId,
  ): Promise<MessageForFrontend[]> {
    await this.chatsService.getChatByIdAndCompanionOrFailHttp(
      chatId,
      currentUser._id,
    );

    const additionalFilters: FilterQuery<MessageDocument> =
      currentUser.blockStatus === 'CANT_SEND_AND_RECEIVE_NEW_MESSAGES' &&
      currentUser.blockStatusUpdatedAt
        ? {
            createdAt: { $lt: currentUser.blockStatusUpdatedAt },
          }
        : {};

    const messagesWithAttachments = await this.messageModel
      .find({
        chat: chatId,
        attachments: {
          $exists: true,
          $type: 'array',
          $ne: [],
        },
        ...additionalFilters,
      })
      .sort({ createdAt: -1 });

    return MessageForFrontend.fromMessages(messagesWithAttachments);
  }

  async getLatestMatchingMessageInChatsOfUser(
    currentUser: UserDocument,
    query: string,
  ): Promise<{ [chatId: string]: MessageDocument }> {
    const chatIds = await this.chatsService.listIdsOfChatsOfUser(
      currentUser._id,
    );

    const additionalFilters: FilterQuery<MessageDocument> =
      currentUser.blockStatus === 'CANT_SEND_AND_RECEIVE_NEW_MESSAGES' &&
      currentUser.blockStatusUpdatedAt
        ? {
            createdAt: { $lt: currentUser.blockStatusUpdatedAt },
          }
        : {};

    const plainMessages: any[] = await this.messageModel
      .aggregate([
        {
          $match: {
            chat: { $in: chatIds },
            ...additionalFilters,
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
            attachments: { $last: '$attachments' },
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
            attachments: 1,
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

  async getLatestMessagesForBlockedUser(
    currentUser: UserDocument,
  ): Promise<{ [chatId: string]: MessageDocument }> {
    const chatIds = await this.chatsService.listIdsOfChatsOfUser(
      currentUser._id,
    );

    const additionalFilters: FilterQuery<MessageDocument> =
      currentUser.blockStatus === 'CANT_SEND_AND_RECEIVE_NEW_MESSAGES' &&
      currentUser.blockStatusUpdatedAt
        ? {
            createdAt: { $lt: currentUser.blockStatusUpdatedAt },
          }
        : {};

    const plainMessages: any[] = await this.messageModel
      .aggregate([
        {
          $match: {
            chat: { $in: chatIds },
            ...additionalFilters,
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
            attachments: { $last: '$attachments' },
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
            attachments: 1,
            externalMetadata: 1,
            privateExternalMetadata: 1,
          },
        },
      ])
      .exec();

    const chatToLatestMessageMapping: {
      [chatId: string]: MessageDocument;
    } = {};

    plainMessages.forEach(plainMessage => {
      const message = this.messageModel.hydrate(plainMessage);
      chatToLatestMessageMapping[message.chat.toHexString()] = message;
    });

    return chatToLatestMessageMapping;
  }

  /**
   * This method is used by admins and users
   */
  async sendMessage(params: CreateMessageParams): Promise<MessageDocument> {
    const chat = await this.chatsService.getChatByIdAndCompanionOrFailHttp(
      params.chatId,
      params.userId,
    );

    const sendingUser = await this.usersService.getUserByIdOrFail(
      params.userId,
    );

    if (sendingUser.blockStatus === 'CANT_SEND_AND_RECEIVE_NEW_MESSAGES') {
      throw ErrorGenerator.create(
        'BLOCK_STATUS_DOES_NOT_ALLOW',
        `You current block status is ${sendingUser.blockStatus}, which does not allow you to send messages.`,
      );
    }

    if (!chat.active) {
      throw ErrorGenerator.create(
        'CHAT_IS_INACTIVE',
        `Chat with ID ${params.chatId} is inactive.`,
      );
    }

    const message = await this.messageModel.create({
      createdAt: new Date(),
      chat: params.chatId,
      user: params.userId,
      content: params.content,
      read: false,
      attachments: params.attachments,
      externalMetadata: params.externalMetadata,
      privateExternalMetadata: params.privateExternalMetadata,
    });

    const companion =
      chat.firstCompanion._id === params.userId
        ? chat.secondCompanion
        : chat.firstCompanion;

    await this.updatesService.createUpdate(
      {
        chatId: params.chatId,
        type: 'new_message',
        message,
      },
      {
        excludeUsersFromBroadcast:
          companion.blockStatus === 'CANT_SEND_AND_RECEIVE_NEW_MESSAGES'
            ? [companion._id]
            : [],
      },
    );

    await this.chatsService.incrementNotReadMessagesCountAndReadCompanionsMessages(
      chat._id,
      chat.firstCompanion._id === params.userId ? 1 : 2,
    );
    await this.chatsService.setLastMessageOfChat(params.chatId, message);

    return message;
  }

  async getPaginatedMessagesForUser(
    currentUser: UserDocument,
    chatId: Types.ObjectId,
    filters?: GetMessagesFiltersDto,
  ): Promise<PaginatedMessagesDto> {
    await this.chatsService.getChatByIdAndCompanionOrFailHttp(
      chatId,
      currentUser._id,
    );

    if (
      currentUser.blockStatus === 'CANT_SEND_AND_RECEIVE_NEW_MESSAGES' &&
      currentUser.blockStatusUpdatedAt
    ) {
      filters.before = currentUser.blockStatusUpdatedAt;
    }

    const messages = await this.getMessagesByChatId(chatId, filters);

    const messagesForFrontend = MessageForFrontend.fromMessages(
      messages,
      currentUser._id,
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

  private async getMessagesByChatId(
    chatId: Types.ObjectId,
    filters?: GetMessagesFiltersDto,
  ): Promise<MessageDocument[]> {
    const createdAtCondition: Condition<Date> = {};

    if (!_.isNil(filters?.after)) {
      createdAtCondition.$gte = filters?.after;
    }

    if (!_.isNil(filters?.before)) {
      createdAtCondition.$lt = filters?.before;
    }

    const messagesQuery = this.messageModel
      .find({
        chat: chatId,
        ...(!_.isEmpty(createdAtCondition)
          ? { createdAt: createdAtCondition }
          : {}),
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

  private async getAllMessagesForAdmin(
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

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { EditChatDto } from './dto/edit-chat.dto';
import { ChatsQueryDto } from './dto/chats-query.dto';
import { FilterQuery, Model, Types } from 'mongoose';
import { ChatModel, ChatDocument } from './schemas/chat.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from '../users/users.service';
import { ErrorGenerator } from '../common/classes/error-generator.class';
import { PaginatedChatsDto } from './dto/paginated-chats.dto';
import { MessageDocument } from '../messages/schemas/message.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { PersonalChatDto } from './dto/personal-chat.dto';
import _ from 'lodash';
import { CreatePersonalChatDto } from './dto/create-personal-chat.dto';
import { UpdatesService } from '../updates/updates.service';
import { APP_CONFIG_KEY, AppConfigType } from '../config/app.config';
import { MessagesService } from '../messages/messages.service';
import { GetUnreadChatsCountQueryDto } from './dto/get-unread-chats-count-query.dto';
import { UnreadChatsCountDto } from './dto/unread-chats-count.dto';

@Injectable()
export class ChatsService {
  constructor(
    @Inject(APP_CONFIG_KEY)
    private readonly appConfigs: AppConfigType,
    @InjectModel(ChatModel.name)
    private readonly chatModel: Model<ChatDocument>,
    @Inject(forwardRef(() => UpdatesService))
    private readonly updatesService: UpdatesService,
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  async createPersonalChat(
    currentUserId: string,
    createData: CreatePersonalChatDto,
  ): Promise<PersonalChatDto> {
    if (!this.appConfigs.disallowUsersToCreateChats) {
      throw ErrorGenerator.create('CHAT_CREATION_IS_DISALLOWED');
    }

    const currentUser = await this.usersService.getUserByIdOrFail(
      currentUserId,
    );

    if (currentUser.blockStatus === 'CANT_SEND_AND_RECEIVE_NEW_MESSAGES') {
      throw ErrorGenerator.create(
        'BLOCK_STATUS_DOES_NOT_ALLOW',
        `Your current block status is ${currentUser.blockStatus}, which does not allow you to create chats.`,
      );
    }

    const secondCompanion = await this.usersService.getUserByIdOrFail(
      createData.companionId,
    );

    const existingChat = await this.chatModel.findOne({
      $or: [
        {
          'firstCompanion._id': currentUser._id,
          'secondCompanion._id': secondCompanion._id,
        },
        {
          'secondCompanion._id': currentUser._id,
          'firstCompanion._id': secondCompanion._id,
        },
      ],
    });

    if (existingChat) {
      throw ErrorGenerator.create('CHAT_ALREADY_EXISTS');
    }

    const chat = await this.chatModel.create({
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      active: true,
      firstCompanion: currentUser,
      secondCompanion: secondCompanion,
      externalMetadata: null,
      privateExternalMetadata: null,
    });

    await this.updatesService.createUpdate({
      chatId: chat._id,
      type: 'new_chat',
      chat,
    });

    return PersonalChatDto.createFromChat(chat, currentUser._id);
  }

  async createChat(createDto: CreateChatDto): Promise<ChatDocument> {
    const firstCompanion = await this.usersService.getUser(
      createDto.firstCompanionId,
    );
    const secondCompanion = await this.usersService.getUser(
      createDto.secondCompanionId,
    );

    const existingChat = await this.chatModel.findOne({
      $or: [
        {
          'firstCompanion._id': firstCompanion._id,
          'secondCompanion._id': secondCompanion._id,
        },
        {
          'secondCompanion._id': firstCompanion._id,
          'firstCompanion._id': secondCompanion._id,
        },
      ],
    });

    if (existingChat) {
      throw ErrorGenerator.create('CHAT_ALREADY_EXISTS');
    }

    createDto.externalMetadata = createDto.externalMetadata;
    createDto.privateExternalMetadata = createDto.privateExternalMetadata;

    const chat = await this.chatModel.create({
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      active: true,
      firstCompanion: firstCompanion,
      secondCompanion: secondCompanion,
      externalMetadata: createDto.externalMetadata,
      privateExternalMetadata: createDto.privateExternalMetadata,
    });

    await this.updatesService.createUpdate({
      chatId: chat._id,
      type: 'new_chat',
      chat,
    });

    return chat;
  }

  async editChat(
    chatId: Types.ObjectId,
    editDto: EditChatDto,
  ): Promise<ChatDocument> {
    const chat = await this.getChatByIdOrCompanionsIdsOrFailHttp(chatId);

    if (!_.isNil(editDto.externalMetadata)) {
      chat.externalMetadata = editDto.externalMetadata;
    }

    if (!_.isNil(editDto.privateExternalMetadata)) {
      chat.privateExternalMetadata = editDto.privateExternalMetadata;
    }

    if (!_.isNil(editDto.active)) {
      chat.active = editDto.active;
    }

    await chat.save();

    return chat;
  }

  async getChatByIdOrCompanionsIdsOrFailHttp(
    chatIdOrCompanionsIds: string | Types.ObjectId,
  ): Promise<ChatDocument> {
    let chat = null;
    if (
      typeof chatIdOrCompanionsIds === 'string' &&
      chatIdOrCompanionsIds.includes(':')
    ) {
      const [companionId1, compationId2] = chatIdOrCompanionsIds.split(':');
      chat = await this.chatModel.findOne({
        deletedAt: null,
        $or: [
          {
            'firstCompanion._id': companionId1,
            'secondCompanion._id': compationId2,
          },
          {
            'firstCompanion._id': compationId2,
            'secondCompanion._id': companionId1,
          },
        ],
      });
    } else {
      chat = await this.chatModel.findOne({
        _id: new Types.ObjectId(chatIdOrCompanionsIds),
        deletedAt: null,
      });
    }

    if (!chat) {
      throw ErrorGenerator.create('CHAT_NOT_FOUND');
    }

    return chat;
  }

  async listAllChats(): Promise<PaginatedChatsDto> {
    const chats = await this.chatModel.find({ deletedAt: null });
    const totalCount = await this.chatModel.count({ deletedAt: null });

    return new PaginatedChatsDto(chats, totalCount);
  }

  /**
   * Находит и возвращает чаты, в которых пользователь с данным
   * ID является собеседником.
   * Но, этот метод возвращает не чистых представителей класса Chat,
   * а преобразовывает их в PersonalChatDto, что намного удобнее для клиентов
   */
  async listPersonalChatsOfUser(
    currentUser: UserDocument,
    query?: ChatsQueryDto,
  ): Promise<PersonalChatDto[]> {
    const additionalFilters: FilterQuery<ChatDocument> = {};

    if (query && query.externalMetadata) {
      const externalMetadataFilters: Record<string, unknown> = _.mapKeys(
        query.externalMetadata,
        (value, key) => `externalMetadata.${key}`,
      );

      _.assign(additionalFilters, externalMetadataFilters);
    }

    let chatToLatestMessageMappingForOverwriting: {
      [chatId: string]: MessageDocument;
    } | null = null;

    if (query && query.query) {
      chatToLatestMessageMappingForOverwriting = await this.messagesService.getLatestMatchingMessageInChatsOfUser(
        currentUser,
        query.query,
      );

      const matchingChatIds = _.keys(chatToLatestMessageMappingForOverwriting);

      const companionNameMatches = await this.chatModel
        .find(
          {
            $or: [
              {
                'firstCompanion._id': currentUser._id,
                $or: [
                  {
                    'secondCompanion.externalMetadata.lastName': {
                      $regex: query,
                    },
                  },
                  {
                    'secondCompanion.externalMetadata.firstName': {
                      $regex: query,
                    },
                  },
                  {
                    'secondCompanion.externalMetadata.secondName': {
                      $regex: query,
                    },
                  },
                ],
              },
              {
                'secondCompanion._id': currentUser._id,
                $or: [
                  {
                    'firstCompanion.externalMetadata.lastName': {
                      $regex: query,
                    },
                  },
                  {
                    'firstCompanion.externalMetadata.firstName': {
                      $regex: query,
                    },
                  },
                  {
                    'firstCompanion.externalMetadata.secondName': {
                      $regex: query,
                    },
                  },
                ],
              },
            ],
          },
          ['_id'],
        )
        .exec();

      additionalFilters._id = {
        $in: matchingChatIds
          .map(id => new Types.ObjectId(id))
          .concat(companionNameMatches.map(id => id._id)),
      };
    } else if (
      currentUser.blockStatus === 'CANT_SEND_AND_RECEIVE_NEW_MESSAGES' &&
      currentUser.blockStatusUpdatedAt
    ) {
      chatToLatestMessageMappingForOverwriting = await this.messagesService.getLatestMessagesForBlockedUser(
        currentUser,
      );
    }

    if (!query.includeInactive) {
      additionalFilters.active = true;
    }

    let chats = await this.chatModel
      .find({
        $or: [
          { 'firstCompanion._id': currentUser._id },
          { 'secondCompanion._id': currentUser._id },
        ],
        ...additionalFilters,
      })
      .sort({ 'lastMessage.createdAt': 'desc' });

    if (query.sort === 'UNREAD_FIRST') {
      const unreadChats: ChatDocument[] = [];
      const readChats: ChatDocument[] = [];

      chats.forEach(chat => {
        if (
          chat.firstCompanion._id === currentUser._id &&
          chat.notReadByFirstCompanionMessagesCount > 0
        ) {
          unreadChats.push(chat);
        } else if (
          chat.secondCompanion._id === currentUser._id &&
          chat.notReadBySecondCompanionMessagesCount > 0
        ) {
          unreadChats.push(chat);
        } else {
          readChats.push(chat);
        }
      });

      chats = [...unreadChats, ...readChats];
    }

    const personalChats = PersonalChatDto.createFromChats(
      chats,
      currentUser._id,
      {
        chatToLatestMessageMappingForOverwriting:
          query && query.query
            ? chatToLatestMessageMappingForOverwriting
            : null,
      },
    );

    return personalChats;
  }

  /**
   * Почти то же самое, что и ChatsService#getPersonalChatsOfUser,
   * отличие в том, что первый возвращает список, а данный метод
   * предназначен для получения одного конкретного чата.
   * Если чат не найден, то выбрасывается ошибка HttpException
   */
  async getPersonalChatOfUserOrFailHttp(
    userId: string,
    chatId: Types.ObjectId,
  ): Promise<PersonalChatDto> {
    const chat = await this.chatModel.findOne({
      $or: [
        { _id: chatId, 'firstCompanion._id': userId },
        { _id: chatId, 'secondCompanion._id': userId },
      ],
    });

    if (!chat) {
      throw ErrorGenerator.create('CHAT_NOT_FOUND');
    }

    const personalChat = PersonalChatDto.createFromChat(chat, userId);

    return personalChat;
  }

  /**
   * Находит чат по его идентификатору и по идентификатору
   * одного из собеседников в этом чате. Если не находит,
   * то выбрасывает HttpException
   */
  async getChatByIdAndCompanionOrFailHttp(
    chatId: Types.ObjectId,
    userId: string,
  ): Promise<ChatDocument> {
    const chat = await this.chatModel.findOne({
      $or: [
        {
          _id: chatId,
          'firstCompanion._id': userId,
        },
        {
          _id: chatId,
          'secondCompanion._id': userId,
        },
      ],
    });

    if (!chat) {
      throw ErrorGenerator.create(
        'CHAT_NOT_FOUND',
        `Chat with ID ${chatId} and companion ${userId} not found.`,
      );
    }

    return chat;
  }

  /**
   * По функционалу эта функция то же самое, что
   * и MessagesService#readMessagesAsUser, с единственным
   * отличием - она возвращает PersonalChat
   */
  async readPersonalChatAsUser(
    chatId: Types.ObjectId,
    userId: string,
  ): Promise<PersonalChatDto> {
    const chat = await this.getChatByIdAndCompanionOrFailHttp(chatId, userId);

    if (userId === chat.firstCompanion._id) {
      chat.notReadByFirstCompanionMessagesCount = 0;
    } else {
      chat.notReadBySecondCompanionMessagesCount = 0;
    }

    await chat.save();

    const personalChat = PersonalChatDto.createFromChat(chat, userId);

    return personalChat;
  }

  async setLastMessageOfChat(
    chatId: Types.ObjectId,
    lastMessage: MessageDocument,
  ): Promise<void> {
    await this.chatModel.updateOne({ _id: chatId }, { lastMessage });
  }

  async incrementNotReadMessagesCountAndReadCompanionsMessages(
    chatId: Types.ObjectId,
    companionNumber: 1 | 2,
  ): Promise<void> {
    await this.chatModel.updateOne(
      { _id: chatId },
      {
        $inc: {
          [companionNumber === 1
            ? 'notReadBySecondCompanionMessagesCount'
            : 'notReadByFirstCompanionMessagesCount']: 1,
        },
        $set: {
          [companionNumber === 1
            ? 'notReadByFirstCompanionMessagesCount'
            : 'notReadBySecondCompanionMessagesCount']: 0,
        },
      },
    );
  }

  async listIdsOfChatsOfUser(userId: string): Promise<Types.ObjectId[]> {
    const chats: { _id: Types.ObjectId }[] = await this.chatModel
      .find(
        {
          $or: [
            { 'firstCompanion._id': userId },
            { 'secondCompanion._id': userId },
          ],
        },
        { _id: true },
      )
      .exec();

    const chatIds = _.map(chats, '_id');

    return chatIds;
  }

  async updateUserInChats(user: UserDocument): Promise<void> {
    await Promise.all([
      this.chatModel.updateMany(
        {
          'firstCompanion._id': user._id,
        },
        { $set: { firstCompanion: user, updatedAt: new Date() } },
      ),
      this.chatModel.updateMany(
        {
          'secondCompanion._id': user._id,
        },
        { $set: { secondCompanion: user, updatedAt: new Date() } },
      ),
    ]);
  }

  async addToDeletedForToLastMessageOfChat(
    chatId: Types.ObjectId,
    deletedFor: string,
  ): Promise<void> {
    await this.chatModel.updateOne(
      {
        _id: chatId,
      },
      { $addToSet: { 'lastMessage.deletedFor': deletedFor } },
    );
  }

  async getUnreadPersonalChatsCount(
    currentUser: UserDocument,
    query?: GetUnreadChatsCountQueryDto,
  ): Promise<UnreadChatsCountDto> {
    const count1 = await this.chatModel.countDocuments({
      'firstCompanion._id': currentUser._id,
      notReadByFirstCompanionMessagesCount: { $gt: 0 },
      active: query.includeInactive === true,
    });

    const count2 = await this.chatModel.countDocuments({
      'secondCompanion._id': currentUser._id,
      notReadBySecondCompanionMessagesCount: { $gt: 0 },
      active: query.includeInactive === true,
    });

    return new UnreadChatsCountDto({ count: count1 + count2 });
  }
}

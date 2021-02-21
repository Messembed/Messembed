import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { EditChatDto } from './dto/edit-chat.dto';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import { ChatsQueryDto } from './dto/chats-query.dto';
import { Model, Types } from 'mongoose';
import { ChatMongo, ChatMongoDocument } from './schemas/chat.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from '../users/users.service';
import { ErrorGenerator } from '../common/classes/error-generator.class';
import { PaginatedChatsInMongoDto } from './dto/paginated-chats-from-mongo.dto';
import { MessageMongoDocument } from '../messages/schemas/message.schema';
import { UserMongoDocument } from '../users/schemas/user.schema';
import { PersonalChatFromMongoDto } from './dto/personal-chat-from-mongo.dto';
import _ from 'lodash';
import { CreatePersonalChatDto } from './dto/create-personal-chat.dto';
import { UpdatesService } from '../updates/updates.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(ChatMongo.name)
    private readonly chatModel: Model<ChatMongoDocument>,
    @Inject(forwardRef(() => UpdatesService))
    private readonly updatesService: UpdatesService,
    private readonly usersService: UsersService,
  ) {}

  async createPersonalChat(
    currentUserId: string,
    createData: CreatePersonalChatDto,
  ): Promise<PersonalChatFromMongoDto> {
    const currentUser = await this.usersService.findOneUserFromMongoOrFail(
      currentUserId,
    );
    const secondCompanion = await this.usersService.findOneUserFromMongoOrFail(
      createData.companionId,
    );

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

    return PersonalChatFromMongoDto.createFromChat(chat, currentUser._id);
  }

  async createChatInMongo(
    createDto: CreateChatDto,
  ): Promise<ChatMongoDocument> {
    const firstCompanion = await this.usersService.getUserFromMongo(
      createDto.firstCompanionId,
    );
    const secondCompanion = await this.usersService.getUserFromMongo(
      createDto.secondCompanionId,
    );

    const existingChat = await this.chatModel.findOne({
      'firstCompanion._id': firstCompanion._id,
      'secondCompanion._id': secondCompanion._id,
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

  async editChatInMongo(
    chatId: Types.ObjectId,
    editDto: EditChatDto,
  ): Promise<ChatMongoDocument> {
    const chat = await this.getChatFromMongoOrFailHttp(chatId);

    chat.externalMetadata = editDto.externalMetadata;
    chat.privateExternalMetadata = editDto.privateExternalMetadata;

    await chat.save();

    return chat;
  }

  async getChatFromMongoOrFailHttp(
    chatId: Types.ObjectId,
  ): Promise<ChatMongoDocument> {
    const chat = await this.chatModel.findOne({ _id: chatId, deletedAt: null });

    if (!chat) {
      throw ErrorGenerator.create('CHAT_NOT_FOUND');
    }

    return chat;
  }

  async getAllChatsFromMongo(): Promise<PaginatedChatsInMongoDto> {
    const chats = await this.chatModel.find({ deletedAt: null });
    const totalCount = await this.chatModel.count({ deletedAt: null });

    return new PaginatedChatsInMongoDto(chats, totalCount);
  }

  /**
   * Находит и возвращает чаты, в которых пользователь с данным
   * ID является собеседником.
   * Но, этот метод возвращает не чистых представителей класса Chat,
   * а преобразовывает их в PersonalChatDto, что намного удобнее для клиентов
   */
  async getPersonalChatsFromMongoOfUser(
    userId: string,
    query?: ChatsQueryDto,
  ): Promise<PersonalChatFromMongoDto[]> {
    const externalMetadataFilters: Record<string, unknown> =
      query && query.externalMetadata
        ? _.mapKeys(
            query.externalMetadata,
            (value, key) => `externalMetadata.${key}`,
          )
        : {};

    const chats = await this.chatModel
      .find({
        $or: [
          { 'firstCompanion._id': userId },
          { 'secondCompanion._id': userId },
        ],
        ...externalMetadataFilters,
      })
      .sort({ 'lastMessage.createdAt': 'desc' });

    const personalChats = PersonalChatFromMongoDto.createFromChats(
      chats,
      userId,
    );

    return personalChats;
  }

  /**
   * Почти то же самое, что и ChatsService#getPersonalChatsOfUser,
   * отличие в том, что первый возвращает список, а данный метод
   * предназначен для получения одного конкретного чата.
   * Если чат не найден, то выбрасывается ошибка HttpException
   */
  async getPersonalChatOfUserFromMongoOrFailHttp(
    userId: string,
    chatId: Types.ObjectId,
  ): Promise<PersonalChatFromMongoDto> {
    const chat = await this.chatModel.findOne({
      $or: [
        { _id: chatId, 'firstCompanion._id': userId },
        { _id: chatId, 'secondCompanion._id': userId },
      ],
    });

    if (!chat) {
      throw ErrorGenerator.create('CHAT_NOT_FOUND');
    }

    const personalChat = PersonalChatFromMongoDto.createFromChat(chat, userId);

    return personalChat;
  }

  /**
   * Находит чат по его идентификатору.
   * Так же проверяет права доступа к этому
   * чату учитывая переданный RequestAuthData.
   * Если нет чата с таким идентификатором, или
   * данный клиент не имеет права доступа к этому чату,
   * то выбрасывается ошибка HttpException.
   *
   * Данный клиент имеет права доступа к этому чату
   * если он:
   * 1. является external service-ом, или;
   * 2. является участником чата.
   */
  async getChatFromMongoConsideringAccessRights(
    chatId: Types.ObjectId,
    authData: RequestAuthData,
  ): Promise<ChatMongoDocument> {
    const chat = authData.isExternalService
      ? await this.getChatFromMongoOrFailHttp(chatId)
      : await this.findChatByIdAndCompanionInMongoOrFailHttp(
          chatId,
          (authData.user as UserMongoDocument)._id,
        );

    return chat;
  }

  /**
   * Находит чат по его идентификатору и по идентификатору
   * одного из собеседников в этом чате. Если не находит,
   * то выбрасывает HttpException
   */
  async findChatByIdAndCompanionInMongoOrFailHttp(
    chatId: Types.ObjectId,
    userId: string,
  ): Promise<ChatMongoDocument> {
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
      throw ErrorGenerator.create('CHAT_NOT_FOUND');
    }

    return chat;
  }

  /**
   * По функционалу эта функция то же самое, что
   * и MessagesService#readMessagesAsUser, с единственным
   * отличием - она возвращает PersonalChat
   */
  async readPersonalChatInMongoAsUser(
    chatId: Types.ObjectId,
    userId: string,
  ): Promise<PersonalChatFromMongoDto> {
    const chat = await this.chatModel.findOne({
      _id: chatId,
      $or: [
        { 'firstCompanion._id': userId },
        { 'secondCompanion._id': userId },
      ],
    });

    if (!chat) {
      throw ErrorGenerator.create('CHAT_NOT_FOUND');
    }

    if (userId === chat.firstCompanion._id) {
      chat.notReadByFirstCompanionMessagesCount = 0;
    } else {
      chat.notReadBySecondCompanionMessagesCount = 0;
    }

    await chat.save();

    const personalChat = PersonalChatFromMongoDto.createFromChat(chat, userId);

    return personalChat;
  }

  async setLastMessageOfChat(
    chatId: Types.ObjectId,
    lastMessage: MessageMongoDocument,
  ): Promise<void> {
    const result = await this.chatModel.updateOne(
      { _id: chatId },
      { lastMessage },
    );

    console.log(result);
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

  async getIdsOfChatsOfUser(userId: string): Promise<Types.ObjectId[]> {
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
}

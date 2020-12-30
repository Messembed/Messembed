import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ChatsRepository } from './repositories/chats.repository';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { EditChatDto } from './dto/edit-chat.dto';
import { PaginatedChatsDto } from './dto/paginated-chats.dto';
import { PersonalChatDto } from './dto/personal-chat.dto';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import { MessagesService } from '../messages/messages.service';
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

@Injectable()
export class ChatsService {
  constructor(
    private readonly chatsRepo: ChatsRepository,
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
    @InjectModel(ChatMongo.name)
    private readonly chatModel: Model<ChatMongoDocument>,
    private readonly usersService: UsersService,
  ) {}

  async createChat(createDto: CreateChatDto): Promise<Chat> {
    const chat = new Chat({
      ...createDto,
      active: true,
    });

    await this.chatsRepo.save(chat);

    return chat;
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

    createDto.title = createDto.title;
    createDto.externalMetadata = createDto.externalMetadata;
    createDto.privateExternalMetadata = createDto.privateExternalMetadata;

    const chat = await this.chatModel.create({
      createdAt: new Date(),
      active: true,
      firstCompanion: firstCompanion,
      secondCompanion: secondCompanion,
      title: createDto.title,
      externalMetadata: createDto.externalMetadata,
      privateExternalMetadata: createDto.privateExternalMetadata,
    });

    return chat;
  }

  async editChat(chatId: number | string, editDto: EditChatDto): Promise<Chat> {
    const chat = await this.chatsRepo.findOneOrFailHttp(chatId);

    this.chatsRepo.merge(chat, editDto);
    await this.chatsRepo.save(chat);

    return chat;
  }

  async editChatInMongo(
    chatId: Types.ObjectId,
    editDto: EditChatDto,
  ): Promise<ChatMongoDocument> {
    const chat = await this.getChatFromMongoOrFailHttp(chatId);

    chat.title = editDto.title;
    chat.externalMetadata = editDto.externalMetadata;
    chat.privateExternalMetadata = editDto.privateExternalMetadata;

    await chat.save();

    return chat;
  }

  async getChat(chatId: number): Promise<Chat> {
    return this.chatsRepo.findOneOrFailHttp(chatId);
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

  async getAllChats(): Promise<PaginatedChatsDto> {
    const [chats, totalCount] = await this.chatsRepo.findAndCount();

    return new PaginatedChatsDto(chats, totalCount);
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
  async getPersonalChatsOfUser(
    userId: string,
    query?: ChatsQueryDto,
  ): Promise<PersonalChatDto[]> {
    const qb = this.chatsRepo
      .createQueryBuilder('chats')
      .leftJoinAndSelect('chats.lastMessage', 'lastMessage')
      .leftJoinAndSelect('chats.firstCompanion', 'firstCompanion')
      .leftJoinAndSelect('chats.secondCompanion', 'secondCompanion')
      .where(
        `((chats.firstCompanionId = :userId) OR (chats.secondCompanionId = :userId))`,
        { userId },
      );

    if (query && query.externalMetadata) {
      qb.andWhere(`chats.externalMetadata @> :externalMetadataQuery::jsonb`, {
        externalMetadataQuery: JSON.stringify(query.externalMetadata),
      });
    }

    const chats = await qb
      .orderBy('COALESCE(lastMessage.createdAt, chats.createdAt)', 'DESC')
      .getMany();

    const unreadMessagesCountPerChat = await this.messagesService.getUnreadMessagesCountPerChatForUser(
      userId,
    );

    const personalChats = PersonalChatDto.createFromChats(
      chats,
      userId,
      unreadMessagesCountPerChat,
    );

    return personalChats;
  }

  /**
   * Находит и возвращает чаты, в которых пользователь с данным
   * ID является собеседником.
   * Но, этот метод возвращает не чистых представителей класса Chat,
   * а преобразовывает их в PersonalChatDto, что намного удобнее для клиентов
   */
  async getPersonalChatsFromMongoOfUser(
    userId: Types.ObjectId,
    query?: ChatsQueryDto,
  ): Promise<PersonalChatFromMongoDto[]> {
    const externalMetadataFilters: Record<string, unknown> =
      query && query.externalMetadata
        ? _.mapKeys(
            query.externalMetadata,
            (value, key) => `externalMetadata.${key}`,
          )
        : {};

    const chats = await this.chatModel.find({
      $or: [
        { 'firstCompanion._id': userId },
        { 'secondCompanion._id': userId },
      ],
      ...externalMetadataFilters,
    });

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
  async getPersonalChatOfUserOrFailHttp(
    userId: string,
    chatId: number,
  ): Promise<PersonalChatDto> {
    const chat = await this.chatsRepo.findOneOrFailHttp({
      where: [
        { id: chatId, firstCompanionId: userId },
        { id: chatId, secondCompanionId: userId },
      ],
      relations: ['lastMessage', 'firstCompanion', 'secondCompanion'],
    });

    return PersonalChatDto.createFromChat(
      chat,
      userId,
      await this.messagesService.getUnreadMessageCountOfChatForUser(
        userId,
        chatId,
      ),
    );
  }

  /**
   * Почти то же самое, что и ChatsService#getPersonalChatsOfUser,
   * отличие в том, что первый возвращает список, а данный метод
   * предназначен для получения одного конкретного чата.
   * Если чат не найден, то выбрасывается ошибка HttpException
   */
  async getPersonalChatOfUserFromMongoOrFailHttp(
    userId: Types.ObjectId,
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
  async getChatConsideringAccessRights(
    chatId: number,
    authData: RequestAuthData,
  ): Promise<Chat> {
    const chat = authData.isExternalService
      ? await this.chatsRepo.findOneOrFailHttp(chatId)
      : await this.findChatByIdAndCompanionOrFailHttp(chatId, authData.user.id);

    return chat;
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
  async findChatByIdAndCompanionOrFailHttp(
    chatId: number,
    userId: string,
  ): Promise<Chat> {
    return this.chatsRepo.findOneOrFailHttp({
      where: [
        {
          id: chatId,
          firstCompanionId: userId,
        },
        {
          id: chatId,
          secondCompanionId: userId,
        },
      ],
    });
  }

  /**
   * Находит чат по его идентификатору и по идентификатору
   * одного из собеседников в этом чате. Если не находит,
   * то выбрасывает HttpException
   */
  async findChatByIdAndCompanionInMongoOrFailHttp(
    chatId: Types.ObjectId,
    userId: Types.ObjectId,
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
  async readPersonalChatAsUser(
    chatId: number,
    userId: string,
  ): Promise<PersonalChatDto> {
    await this.messagesService.readMessagesAsUser(chatId, userId);

    return this.getPersonalChatOfUserOrFailHttp(userId, chatId);
  }

  /**
   * По функционалу эта функция то же самое, что
   * и MessagesService#readMessagesAsUser, с единственным
   * отличием - она возвращает PersonalChat
   */
  async readPersonalChatInMongoAsUser(
    chatId: Types.ObjectId,
    userId: Types.ObjectId,
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

    if (userId.equals(chat.firstCompanion._id)) {
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
}

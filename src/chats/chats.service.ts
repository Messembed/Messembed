import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ChatsRepository } from './repositories/Chats.repository';
import { Chat } from './entities/Chat.entity';
import { CreateChatDto } from './dto/CreateChat.dto';
import { EditChatDto } from './dto/EditChat.dto';
import { PaginatedChatsDto } from './dto/PaginatedChats.dto';
import { PersonalChatDto } from './dto/PersonalChat.dto';
import { RequestAuthData } from '../auth/classes/RequestAuthData.class';
import { MessagesService } from '../messages/messages.service';
import { ChatsQueryDto } from './dto/ChatsQuery.dto';

@Injectable()
export class ChatsService {
  constructor(
    private readonly chatsRepo: ChatsRepository,
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
  ) {}

  async createChat(createDto: CreateChatDto): Promise<Chat> {
    const chat = new Chat(createDto);

    await this.chatsRepo.save(chat);

    return chat;
  }

  async editChat(chatId: number | string, editDto: EditChatDto): Promise<Chat> {
    const chat = await this.chatsRepo.findOneOrFailHttp(chatId);

    this.chatsRepo.merge(chat, editDto);
    await this.chatsRepo.save(chat);

    return chat;
  }

  async getChat(chatId: number): Promise<Chat> {
    return this.chatsRepo.findOneOrFailHttp(chatId);
  }

  async getAllChats(): Promise<PaginatedChatsDto> {
    const [chats, totalCount] = await this.chatsRepo.findAndCount();

    return new PaginatedChatsDto(chats, totalCount);
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
}

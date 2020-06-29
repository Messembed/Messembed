import { Injectable } from '@nestjs/common';
import { ChatsRepository } from './repositories/Chats.repository';
import { Chat } from './entities/Chat.entity';
import { CreateChatDto } from './dto/CreateChat.dto';
import { EditChatDto } from './dto/EditChat.dto';
import { PaginatedChatsDto } from './dto/PaginatedChats.dto';
import { UsersRepository } from '../users/repositories/Users.repository';
import { PersonalChatDto } from './dto/PersonalChat.dto';
import { RequestAuthData } from '../auth/classes/RequestAuthData.class';

@Injectable()
export class ChatsService {
  constructor(
    private readonly chatsRepo: ChatsRepository,
    private readonly usersRepo: UsersRepository,
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

  async getPersonalChatsOfUser(userId: string): Promise<PersonalChatDto[]> {
    const chats = await this.chatsRepo
      .createQueryBuilder('chats')
      .leftJoinAndSelect('chats.lastMessage', 'lastMessage')
      .leftJoinAndSelect('chats.firstCompanion', 'firstCompanion')
      .leftJoinAndSelect('chats.secondCompanion', 'secondCompanion')
      .where([{ firstCompanionId: userId }, { secondCompanionId: userId }])
      .orderBy('COALESCE(lastMessage.createdAt, chats.createdAt)', 'DESC')
      .getMany();

    const personalChats = PersonalChatDto.createFromChat(chats, userId);

    return personalChats;
  }

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

    return PersonalChatDto.createFromChat(chat, userId);
  }

  async getChatConsideringAccessRights(
    chatId: number,
    authData: RequestAuthData,
  ): Promise<Chat> {
    const chat = authData.isExternalService
      ? await this.chatsRepo.findOneOrFailHttp(chatId)
      : await this.findChatByIdAndCompanionOrFailHttp(chatId, authData.user.id);

    return chat;
  }

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
}

import { Injectable } from '@nestjs/common';
import { ChatsRepository } from './repositories/Chats.repository';
import { Chat } from './entities/Chat.entity';
import { CreateChatDto } from './dto/CreateChat.dto';
import { EditChatDto } from './dto/EditChat.dto';
import { PaginatedChatsDto } from './dto/PaginatedChats.dto';
import { UsersRepository } from '../users/repositories/Users.repository';

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

  async getChat(chatId: string | number): Promise<Chat> {
    return this.chatsRepo.findOneOrFailHttp(chatId);
  }

  async getAllChats(): Promise<PaginatedChatsDto> {
    const [chats, totalCount] = await this.chatsRepo.findAndCount();

    return new PaginatedChatsDto(chats, totalCount);
  }

  async getPersonalChats(externalUserId: string): Promise<Chat[]> {
    const user = await this.usersRepo.findOneOrFailHttp({
      externalId: externalUserId,
    });

    const chats = await this.chatsRepo
      .createQueryBuilder('chats')
      .leftJoinAndSelect('chats.lastMessage', 'lastMessage')
      .where([{ initiatorId: user.id }, { companionId: user.id }])
      .orderBy('COALESCE(lastMessage.createdAt, chats.createdAt)', 'DESC')
      .getMany();

    return chats;
  }
}

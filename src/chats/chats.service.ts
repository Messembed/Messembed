import { Injectable } from '@nestjs/common';
import { ChatRepository } from './repositories/chat.repository';
import { Chat } from './entities/Chat.entity';
import { CreateChatDto } from './dto/CreateChat.dto';
import { EditChatDto } from './dto/EditChat.dto';
import { ErrorGenerator } from '../common/classes/ErrorGenerator.class';
import { PaginatedChats } from './dto/PaginatedChats.dto';

@Injectable()
export class ChatsService {
  constructor(private readonly chatRepo: ChatRepository) {}

  async createChat(createDto: CreateChatDto): Promise<Chat> {
    const chat = new Chat(createDto);

    await this.chatRepo.save(chat);

    return chat;
  }

  async updateChat(
    chatId: number | string,
    editDto: EditChatDto,
  ): Promise<Chat> {
    const chat = await this.findChatOrFail(chatId);

    this.chatRepo.merge(chat, editDto);
    await this.chatRepo.save(chat);

    return chat;
  }

  async getChat(chatId: string | number): Promise<Chat> {
    return this.findChatOrFail(chatId);
  }

  async getAllChats(): Promise<PaginatedChats> {
    const [chats, totalCount] = await this.chatRepo.findAndCount();

    return new PaginatedChats(chats, totalCount);
  }

  async findChatOrFail(chatId: string | number): Promise<Chat> {
    const chat = await this.chatRepo.findOne(chatId);

    if (!chat) {
      throw ErrorGenerator.create('CHAT_NOT_FOUND');
    }

    return chat;
  }
}

import { Injectable } from '@nestjs/common';
import { ChatRepository } from './repositories/chat.repository';
import { Chat } from './entities/Chat.entity';

@Injectable()
export class ChatsService {
  constructor(private readonly chatRepo: ChatRepository) {}

  async createChat(title: string): Promise<Chat> {
    const chat = new Chat({
      title,
    });

    await this.chatRepo.save(chat);

    return chat;
  }
}

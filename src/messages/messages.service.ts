import { Injectable } from '@nestjs/common';
import { MessagesRepository } from './repositories/Messages.repository';
import { CreateMessageOptions } from './interfaces/CreateMessageOptions.interface';
import { Message } from './entities/Message.entity';
import { GetMessagesFiltersDto } from './dto/GetMessagesFilters.dto';
import _ from 'lodash';
import { MoreThan, LessThan } from 'typeorm';
import { ChatsRepository } from '../chats/repositories/Chats.repository';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { PaginatedMessagesDto } from './dto/PaginatedMessages.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepo: MessagesRepository,
    private readonly chatsRepo: ChatsRepository,
  ) {}

  @Transactional()
  async createMessage(options: CreateMessageOptions): Promise<Message> {
    const msg = new Message(options);

    await this.messagesRepo.save(msg);

    await this.chatsRepo.update(options.chatId, {
      lastMessageId: msg.id,
    });

    return msg;
  }

  async getPaginatedMessages(
    chatId: number,
    filters?: GetMessagesFiltersDto,
  ): Promise<PaginatedMessagesDto> {
    const messages = await this.getMessages(chatId, filters);

    return new PaginatedMessagesDto({
      ...filters,
      messages,
    });
  }

  async getMessages(
    chatId: number,
    filters?: GetMessagesFiltersDto,
  ): Promise<Message[]> {
    const idFilters = !_.isNil(filters?.afterId)
      ? MoreThan(filters?.afterId)
      : !_.isNil(filters?.beforeId)
      ? LessThan(filters?.beforeId)
      : undefined;
    const messages = await this.messagesRepo.find({
      where: {
        chatId,
        ...(idFilters ? { id: idFilters } : {}),
      },
      order: {
        id: 'ASC',
      },
      skip: filters?.offset || undefined,
      take: filters?.limit || undefined,
    });

    return messages;
  }
}

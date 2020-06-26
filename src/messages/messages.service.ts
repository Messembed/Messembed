import { Injectable } from '@nestjs/common';
import { MessagesRepository } from './repositories/Messages.repository';
import { CreateMessageOptions } from './interfaces/CreateMessageOptions.interface';
import { Message } from './entities/Message.entity';
import { GetMessagesFiltersDto } from './dtos/GetMessagesFilters.dto';
import _ from 'lodash';
import { MoreThan, LessThan } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(private readonly messagesRepo: MessagesRepository) {}

  async createMessage(options: CreateMessageOptions): Promise<Message> {
    const msg = new Message(options);

    await this.messagesRepo.save(msg);

    return msg;
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

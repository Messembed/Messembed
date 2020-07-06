import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { MessagesRepository } from './repositories/messages.repository';
import { CreateMessageOptions } from './interfaces/create-message-options.interface';
import { Message } from './entities/message.entity';
import { GetMessagesFiltersDto } from './dto/get-messages-filters.dto';
import _ from 'lodash';
import { MoreThan, LessThan, Not } from 'typeorm';
import { ChatsRepository } from '../chats/repositories/chats.repository';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { PaginatedMessagesDto } from './dto/paginated-messages.dto';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import { ChatsService } from '../chats/chats.service';
import { UnreadMessagesCountPerChat } from './interfaces/unread-messages-count-per-chat.interface';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepo: MessagesRepository,
    @Inject(forwardRef(() => ChatsService))
    private readonly chatsService: ChatsService,
    private readonly chatsRepo: ChatsRepository,
  ) {}

  @Transactional()
  async createMessage(options: CreateMessageOptions): Promise<Message> {
    await this.chatsService.findChatByIdAndCompanionOrFailHttp(
      options.chatId,
      options.userId,
    );

    const msg = new Message(options);

    await this.messagesRepo.save(msg);

    await this.readMessagesAsUser(options.chatId, options.userId);

    await this.chatsRepo.update(options.chatId, {
      lastMessageId: msg.id,
    });

    return msg;
  }

  async getPaginatedMessagesConsideringAccessRights(
    authData: RequestAuthData,
    chatId: number,
    filters?: GetMessagesFiltersDto,
  ): Promise<PaginatedMessagesDto> {
    const chat = await this.chatsService.getChatConsideringAccessRights(
      chatId,
      authData,
    );

    return this.getPaginatedMessages(chat.id, filters);
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

  async getUnreadMessagesCountPerChatForUser(
    userId: string,
  ): Promise<UnreadMessagesCountPerChat> {
    const unreadMessagesCountPerChat = await this.messagesRepo
      .createQueryBuilder('messages')
      .select([
        'messages.chatId as "chatId"',
        'COUNT(messages.id) as "unreadCount"',
      ])
      .where('messages.userId <> :currentUserId', { currentUserId: userId })
      .andWhere('messages.read = False')
      .groupBy('messages.chatId')
      .getRawMany<{ chatId: number; unreadCount: number }>();

    return unreadMessagesCountPerChat.reduce<UnreadMessagesCountPerChat>(
      (acc, unreadCountPerChat) => {
        acc[unreadCountPerChat.chatId] = unreadCountPerChat.unreadCount;
        return acc;
      },
      {},
    );
  }

  async getUnreadMessageCountOfChatForUser(
    userId: string,
    chatId: number,
  ): Promise<number> {
    return await this.messagesRepo
      .createQueryBuilder('messages')
      .where('messages.userId <> :currentUserId', { currentUserId: userId })
      .andWhere('messages.read = False')
      .andWhere('messages.chatId = :chatId', {
        chatId,
      })
      .getCount();
  }

  async readMessagesAsUser(chatId: number, userId: string): Promise<void> {
    await this.messagesRepo.update(
      {
        chatId: chatId,
        userId: Not(userId),
        read: false,
      },
      { read: true },
    );
  }
}

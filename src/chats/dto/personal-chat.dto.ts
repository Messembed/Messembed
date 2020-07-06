import { Message } from '../../messages/entities/message.entity';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { DeepPartial } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { classToPlain } from 'class-transformer';
import { UnreadMessagesCountPerChat } from '../../messages/interfaces/unread-messages-count-per-chat.interface';

export class PersonalChatDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: 'string', format: 'ISO 8061' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'ISO 8061' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'ISO 8061' })
  deletedAt?: Date | null;

  @ApiProperty()
  title: string;

  @ApiProperty()
  active: boolean;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  externalMetadata?: Record<string, unknown> | null;

  @ApiPropertyOptional()
  lastMessageId: number;

  @ApiPropertyOptional({ type: () => Message })
  lastMessage: Message;

  @ApiProperty({ type: () => User })
  companion: User;

  @ApiProperty()
  unreadMessagesCount: number;

  static createFromChats(
    chats: Chat[],
    userId: string,
    unreadMessagesCountPerChat: UnreadMessagesCountPerChat,
  ): PersonalChatDto[] {
    return chats.map(chat =>
      this.createFromChat(chat, userId, unreadMessagesCountPerChat[chat.id]),
    );
  }

  static createFromChat(
    chat: Chat,
    userId: string,
    unreadMessagesCount: number | void,
  ): PersonalChatDto {
    const plainChat: any = classToPlain(chat);

    return new PersonalChatDto({
      id: plainChat.id,
      createdAt: plainChat.createdAt,
      updatedAt: plainChat.updatedAt,
      deletedAt: plainChat.deletedAt,
      title: plainChat.title,
      active: plainChat.active,
      externalMetadata: plainChat.externalMetadata,
      lastMessageId: plainChat.lastMessageId,
      lastMessage: plainChat.lastMessage,
      companion:
        plainChat.firstCompanion.id !== userId
          ? plainChat.firstCompanion
          : plainChat.secondCompanion,
      unreadMessagesCount: unreadMessagesCount || 0,
    });
  }

  constructor(fields: DeepPartial<PersonalChatDto>) {
    Object.assign(this, fields);
  }
}

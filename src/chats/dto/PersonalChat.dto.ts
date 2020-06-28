import { Message } from '../../messages/entities/Message.entity';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/User.entity';
import { DeepPartial } from 'typeorm';
import _ from 'lodash';
import { Chat } from '../entities/Chat.entity';
import { classToPlain } from 'class-transformer';

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
  read: boolean;

  static createFromChat(chat: Chat, userId: number): PersonalChatDto;
  static createFromChat(chats: Chat[], userId: number): PersonalChatDto[];
  static createFromChat(
    chats: Chat | Chat[],
    userId: number,
  ): PersonalChatDto | PersonalChatDto[] {
    if (_.isArray(chats)) {
      return chats.map(chat => this._createFromChat(chat, userId));
    }

    return this._createFromChat(chats, userId);
  }

  private static _createFromChat(chat: Chat, userId: number): PersonalChatDto {
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
      read: plainChat.lastMessage
        ? plainChat.lastMessage.userId === userId
          ? true
          : plainChat.lastMessage.read
        : true,
    });
  }

  constructor(fields: DeepPartial<PersonalChatDto>) {
    Object.assign(this, fields);
  }
}

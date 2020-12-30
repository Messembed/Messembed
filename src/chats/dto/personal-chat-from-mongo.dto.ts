import { Message } from '../../messages/entities/message.entity';
import { MessageMongo } from '../../messages/schemas/message.schema';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { DeepPartial } from 'typeorm';
import { Types } from 'mongoose';
import { UserMongo } from '../../users/schemas/user.schema';
import { ChatMongoDocument } from '../schemas/chat.schema';

export class PersonalChatFromMongoDto {
  @ApiProperty()
  _id: Types.ObjectId;

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

  @ApiPropertyOptional({ type: () => Message })
  lastMessage: MessageMongo;

  @ApiProperty({ type: () => User })
  companion: UserMongo;

  @ApiProperty()
  unreadMessagesCount: number;

  static createFromChats(
    chats: ChatMongoDocument[],
    userId: Types.ObjectId,
  ): PersonalChatFromMongoDto[] {
    return chats.map(chat => this.createFromChat(chat, userId));
  }

  static createFromChat(
    chat: ChatMongoDocument,
    userId: Types.ObjectId,
  ): PersonalChatFromMongoDto {
    return new PersonalChatFromMongoDto({
      _id: chat._id,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      deletedAt: chat.deletedAt,
      title: chat.title,
      active: chat.active,
      externalMetadata: chat.externalMetadata,
      lastMessage: chat.lastMessage.toJSON(),
      companion: chat.firstCompanion._id.equals(userId)
        ? chat.secondCompanion.toJSON()
        : chat.firstCompanion.toJSON(),
      unreadMessagesCount: chat.firstCompanion._id.equals(userId)
        ? chat.notReadBySecondCompanionMessagesCount
        : chat.notReadByFirstCompanionMessagesCount,
    });
  }

  constructor(fields: DeepPartial<PersonalChatFromMongoDto>) {
    Object.assign(this, fields);
  }
}

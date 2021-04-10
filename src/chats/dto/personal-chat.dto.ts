import { MessageDocument } from '../../messages/schemas/message.schema';
import { MessageForFrontend } from '../../messages/dto/message-for-frontend.dto';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { UserModel } from '../../users/schemas/user.schema';
import { ChatDocument } from '../schemas/chat.schema';

export class PersonalChatDto {
  @ApiProperty({ type: 'string' })
  _id: Types.ObjectId;

  @ApiProperty({ type: 'string', format: 'ISO 8061' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'ISO 8061' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: 'string', format: 'ISO 8061' })
  deletedAt?: Date | null;

  @ApiProperty()
  active: boolean;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  externalMetadata?: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: () => MessageForFrontend })
  lastMessage: MessageForFrontend;

  @ApiProperty({ type: () => Object })
  companion: UserModel;

  @ApiProperty()
  unreadMessagesCount: number;

  static createFromChats(
    chats: ChatDocument[],
    currentUserId: string,
    options?: {
      chatToLatestMatchingMessageMapping?: {
        [chatId: string]: MessageDocument;
      };
    },
  ): PersonalChatDto[] {
    return chats.map(chat =>
      this.createFromChat(chat, currentUserId, {
        overrideLatestMessage:
          options && options.chatToLatestMatchingMessageMapping
            ? options.chatToLatestMatchingMessageMapping[chat._id.toString()]
            : chat.lastMessage,
      }),
    );
  }

  static createFromChat(
    chat: ChatDocument,
    currentUserId: string,
    options?: { overrideLatestMessage?: MessageDocument },
  ): PersonalChatDto {
    const lastMessage: MessageForFrontend =
      options && options.overrideLatestMessage
        ? MessageForFrontend.fromMessage(
            options.overrideLatestMessage,
            currentUserId,
          )
        : chat.lastMessage
        ? MessageForFrontend.fromMessage(chat.lastMessage, currentUserId)
        : null;

    return new PersonalChatDto({
      _id: chat._id,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      deletedAt: chat.deletedAt,
      active: chat.active,
      externalMetadata: chat.externalMetadata,
      lastMessage,
      companion:
        chat.firstCompanion._id === currentUserId
          ? chat.secondCompanion.toJSON()
          : chat.firstCompanion.toJSON(),
      unreadMessagesCount:
        chat.firstCompanion._id === currentUserId
          ? chat.notReadByFirstCompanionMessagesCount
          : chat.notReadBySecondCompanionMessagesCount,
    });
  }

  constructor(fields: PersonalChatDto) {
    Object.assign(this, fields);
  }
}

import { MessageForFrontend } from '../../messages/dto/message-for-frontend.dto';
import { PersonalChatFromMongoDto } from '../../chats/dto/personal-chat-from-mongo.dto';
import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateDocument } from '../schemas/update.schema';

export class UpdateDto {
  @ApiProperty({ type: String })
  _id: Types.ObjectId;

  @ApiProperty({ type: String })
  createdAt: Date;

  @ApiProperty({ type: String })
  chatId: Types.ObjectId;

  @ApiProperty({ type: String, enum: ['new_message', 'new_chat'] })
  type: string;

  @ApiPropertyOptional({ type: () => MessageForFrontend })
  message?: MessageForFrontend;

  @ApiPropertyOptional({ type: () => PersonalChatFromMongoDto })
  chat?: PersonalChatFromMongoDto;

  static fromUpdates(
    updates: UpdateDocument[],
    currentUserId: string,
  ): UpdateDto[] {
    return updates.map(update => UpdateDto.fromUpdate(update, currentUserId));
  }

  static fromUpdate(update: UpdateDocument, currentUserId: string): UpdateDto {
    return new UpdateDto({
      ...update.toJSON(),
      chat: update.chat
        ? PersonalChatFromMongoDto.createFromChat(update.chat, currentUserId)
        : null,
      message: update.message
        ? MessageForFrontend.fromMessage(update.message, currentUserId)
        : null,
    });
  }

  constructor(fields: UpdateDto) {
    Object.assign(this, fields);
  }
}

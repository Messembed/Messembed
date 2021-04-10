import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageDocument } from '../schemas/message.schema';
import { Types } from 'mongoose';

export class MessageForFrontend {
  @ApiProperty()
  _id: Types.ObjectId;

  @ApiProperty({ type: String })
  createdAt: Date;

  @ApiPropertyOptional({ type: String })
  updatedAt?: Date;

  @ApiPropertyOptional({ type: String })
  deletedAt?: Date | null;

  @ApiPropertyOptional({ type: String })
  editedAt?: Date | null;

  @ApiProperty({ type: String })
  chat: Types.ObjectId;

  @ApiProperty({ type: String })
  user: string;

  @ApiProperty({ type: String })
  content: string;

  @ApiProperty()
  read: boolean;

  @ApiProperty()
  fromMe: boolean;

  @ApiPropertyOptional()
  externalMetadata?: Record<string, unknown> | null;

  @ApiPropertyOptional()
  privateExternalMetadata?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    type: Object,
    isArray: true,
    additionalProperties: true,
  })
  attachments?: Record<string, unknown>[];

  static fromMessages(
    messages: MessageDocument[],
    currentUserId?: string,
  ): MessageForFrontend[] {
    return messages.map(message => this.fromMessage(message, currentUserId));
  }

  static fromMessage(
    message: MessageDocument,
    currentUserId?: string,
  ): MessageForFrontend {
    return new MessageForFrontend({
      ...message.toJSON(),
      _id: message._id, // to suppress typescript's error
      fromMe: currentUserId === message.user,
    });
  }

  constructor(fields: MessageForFrontend) {
    Object.assign(this, fields);
  }
}

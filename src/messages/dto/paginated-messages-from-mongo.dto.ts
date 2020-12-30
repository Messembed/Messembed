import { MessageMongo, MessageMongoDocument } from '../schemas/message.schema';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';

export class PaginatedMessagesFromMongoDto {
  @ApiPropertyOptional()
  afterId?: number;

  @ApiPropertyOptional()
  beforeId?: number;

  @ApiPropertyOptional()
  offset?: number;

  @ApiPropertyOptional()
  limit?: number;

  @ApiProperty({ type: () => Object, isArray: true })
  messages: MessageMongo[];

  constructor(
    fields: DeepPartial<Omit<PaginatedMessagesFromMongoDto, 'messages'>> & {
      messages: MessageMongoDocument[];
    },
  ) {
    Object.assign(this, {
      ...fields,
      messages: fields.messages.map(msg => msg.toJSON()),
    });
  }
}

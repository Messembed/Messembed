import { Message } from '../entities/message.entity';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';

export class PaginatedMessagesDto {
  @ApiPropertyOptional()
  afterId?: number;

  @ApiPropertyOptional()
  beforeId?: number;

  @ApiPropertyOptional()
  offset?: number;

  @ApiPropertyOptional()
  limit?: number;

  @ApiProperty({ type: () => Message, isArray: true })
  messages: Message[];

  constructor(fields: DeepPartial<PaginatedMessagesDto>) {
    Object.assign(this, fields);
  }
}

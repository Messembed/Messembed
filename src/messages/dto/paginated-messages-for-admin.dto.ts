import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { MessageMongoDocument } from '../schemas/message.schema';

export class PaginatedMessagesForAdminDto {
  @ApiPropertyOptional()
  afterId?: number;

  @ApiPropertyOptional()
  beforeId?: number;

  @ApiPropertyOptional()
  offset?: number;

  @ApiPropertyOptional()
  limit?: number;

  @ApiProperty({ type: () => Object, isArray: true })
  messages: MessageMongoDocument[];

  constructor(fields: PaginatedMessagesForAdminDto) {
    Object.assign(this, fields);
  }
}

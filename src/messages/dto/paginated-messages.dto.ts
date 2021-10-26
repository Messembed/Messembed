import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { MessageForFrontend } from './message-for-frontend.dto';

export class PaginatedMessagesDto {
  @ApiPropertyOptional()
  afterId?: number;

  @ApiPropertyOptional()
  beforeId?: number;

  @ApiPropertyOptional()
  offset?: number;

  @ApiPropertyOptional()
  limit?: number;

  @ApiProperty({ type: () => Object, isArray: true })
  messages: MessageForFrontend[];

  constructor(fields: PaginatedMessagesDto) {
    Object.assign(this, fields);
  }
}

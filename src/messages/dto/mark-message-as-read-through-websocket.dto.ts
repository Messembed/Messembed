import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class MarkMessageAsReadThroughWebSocketDto {
  @ApiProperty()
  @IsMongoId()
  chatId: string;

  @ApiProperty()
  @IsMongoId()
  messageId: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class SendWritingIndicatorDto {
  @ApiProperty({ description: 'ID чата' })
  @IsMongoId()
  chatId: string;
}

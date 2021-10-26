import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChatPathDto {
  @ApiProperty({ description: 'ID чата' })
  @IsString()
  chatId: string;
}

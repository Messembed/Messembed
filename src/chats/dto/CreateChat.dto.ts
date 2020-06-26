import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateChatDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  title: string;
}

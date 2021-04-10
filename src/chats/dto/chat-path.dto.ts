import { ApiProperty } from '@nestjs/swagger';

export class ChatPathDto {
  @ApiProperty({ description: 'ID чата' })
  chatId: string;
}

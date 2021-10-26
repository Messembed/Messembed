import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetChatPathDto {
  @ApiProperty({
    description:
      'ID чата, например `/admin-api/chats/606f10f50ae8cd0e8bf66581` или айди собеседников разделенными двоеточием, например `/admin-api/chats/1234:2345`',
  })
  @IsString()
  chatIdOrCompanionsIds: string;
}

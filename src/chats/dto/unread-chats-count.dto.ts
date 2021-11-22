import { ApiProperty } from '@nestjs/swagger';

export class UnreadChatsCountDto {
  @ApiProperty()
  count: number;

  constructor(data: UnreadChatsCountDto) {
    Object.assign(this, data);
  }
}

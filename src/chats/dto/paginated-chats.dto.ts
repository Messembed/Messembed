import { ApiProperty } from '@nestjs/swagger';
import { ChatDocument } from '../schemas/chat.schema';

export class PaginatedChatsDto {
  @ApiProperty({ type: () => Object, isArray: true })
  data: any[];

  @ApiProperty()
  totalCount: number;

  constructor(chats: ChatDocument[], totalCount: number) {
    this.totalCount = totalCount;
    this.data = chats.map(chat => chat.toJSON());
  }
}

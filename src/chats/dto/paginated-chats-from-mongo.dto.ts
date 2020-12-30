import { ApiProperty } from '@nestjs/swagger';
import { ChatMongoDocument } from '../schemas/chat.schema';

export class PaginatedChatsInMongoDto {
  @ApiProperty({ type: () => Object, isArray: true })
  data: any[];

  @ApiProperty()
  totalCount: number;

  constructor(chats: ChatMongoDocument[], totalCount: number) {
    this.totalCount = totalCount;
    this.data = chats.map(chat => chat.toJSON());
  }
}

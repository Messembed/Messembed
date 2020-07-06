import { Chat } from '../entities/chat.entity';
import { AbstractPaginated } from '../../common/classes/abstract-paginated.class';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedChatsDto extends AbstractPaginated<Chat> {
  @ApiProperty({ type: () => Chat, isArray: true })
  data: Chat[];
}

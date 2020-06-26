import { Chat } from '../entities/Chat.entity';
import { AbstractPaginated } from '../../common/classes/AbstractPaginated.class';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedChatsDto extends AbstractPaginated<Chat> {
  @ApiProperty({ type: () => Chat, isArray: true })
  data: Chat[];
}

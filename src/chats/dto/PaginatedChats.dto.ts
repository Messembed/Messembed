import { Chat } from '../entities/Chat.entity';
import { AbstractPaginated } from '../../common/classes/AbstractPaginated.class';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedChats extends AbstractPaginated<Chat> {
  @ApiProperty({ type: () => Chat, isArray: true })
  data: Chat[];
}

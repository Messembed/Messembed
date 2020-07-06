import { Paginated } from '../interfaces/paginated.interface';
import { ApiProperty } from '@nestjs/swagger';

export abstract class AbstractPaginated<Entity> implements Paginated<Entity> {
  @ApiProperty()
  totalCount: number;

  data: Entity[];

  constructor(data: Entity[], totalCount: number) {
    this.totalCount = totalCount;
    this.data = data;
  }
}

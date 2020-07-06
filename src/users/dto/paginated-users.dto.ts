import { AbstractPaginated } from '../../common/classes/abstract-paginated.class';
import { User } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedUsersDto extends AbstractPaginated<User> {
  @ApiProperty({ type: () => User, isArray: true })
  data: User[];
}

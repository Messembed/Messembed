import { AbstractPaginated } from '../../common/classes/AbstractPaginated.class';
import { User } from '../entities/User.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedUsersDto extends AbstractPaginated<User> {
  @ApiProperty({ type: () => User, isArray: true })
  data: User[];
}

import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { UserMongoDocument } from '../schemas/user.schema';

export class PaginatedUserInMongoDto {
  @ApiProperty({ type: () => User, isArray: true })
  data: any[];

  @ApiProperty()
  totalCount: number;

  constructor(users: UserMongoDocument[], totalCount: number) {
    this.totalCount = totalCount;
    this.data = users.map(user => user.toJSON());
  }
}

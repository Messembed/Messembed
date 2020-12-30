import { ApiProperty } from '@nestjs/swagger';
import { UserMongoDocument } from '../schemas/user.schema';

export class PaginatedUserInMongoDto {
  @ApiProperty({ type: () => Object, isArray: true })
  data: any[];

  @ApiProperty()
  totalCount: number;

  constructor(users: UserMongoDocument[], totalCount: number) {
    this.totalCount = totalCount;
    this.data = users.map(user => user.toJSON());
  }
}

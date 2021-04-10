import { ApiProperty } from '@nestjs/swagger';
import { UserDocument } from '../schemas/user.schema';

export class PaginatedUsersDto {
  @ApiProperty({ type: () => Object, isArray: true })
  data: any[];

  @ApiProperty()
  totalCount: number;

  constructor(users: UserDocument[], totalCount: number) {
    this.totalCount = totalCount;
    this.data = users.map(user => user.toJSON());
  }
}

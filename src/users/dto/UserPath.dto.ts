import { ResourcePathIdParam } from '../../common/decorators/resource-path-id-param.decorator';

export class UserPathDto {
  @ResourcePathIdParam({ description: 'ID пользователя' })
  userId: number;
}

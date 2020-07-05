import { ResourcePathIdParam } from '../../common/decorators/resource-path-id-param.decorator';
import { ValidationGroup } from '../../common/constants/validation-group.enum';

export class ChatPathDto {
  @ResourcePathIdParam(
    { description: 'ID чата' },
    { groups: [ValidationGroup.ALL] },
  )
  chatId: number;
}

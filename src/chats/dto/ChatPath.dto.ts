import { ResourcePathIdParam } from '../../common/decorators/resource-path-id-param.decorator';

export class ChatPathDto {
  @ResourcePathIdParam({ description: 'ID чата' })
  chatId: number;
}

import { User } from '../../users/entities/user.entity';
import { UserMongoDocument } from '../../users/schemas/user.schema';

export class RequestAuthData {
  user?: User | UserMongoDocument;
  externalService?: string;
  isExternalService: boolean;

  constructor(fields: Partial<RequestAuthData>) {
    Object.assign(this, fields);
  }
}

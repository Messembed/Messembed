import { UserMongoDocument } from '../../users/schemas/user.schema';

export class RequestAuthData {
  user?: UserMongoDocument;
  externalService?: string;
  isExternalService: boolean;

  constructor(fields: Partial<RequestAuthData>) {
    Object.assign(this, fields);
  }
}

import { User } from '../../users/entities/user.entity';

export class RequestAuthData {
  user?: User;
  externalService?: string;
  isExternalService: boolean;

  constructor(fields: Partial<RequestAuthData>) {
    Object.assign(this, fields);
  }
}

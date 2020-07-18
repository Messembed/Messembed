import { AuthGuard } from '@nestjs/passport';

export const UserOrExternalServiceAuthGuard = AuthGuard([
  'jwt',
  'external-service-basic',
]);

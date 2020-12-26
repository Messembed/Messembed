import { AuthGuard } from '@nestjs/passport';

export const UserOrExternalServiceAuthGuard = AuthGuard([
  'external-service-basic',
  'jwt',
  'cookies',
]);

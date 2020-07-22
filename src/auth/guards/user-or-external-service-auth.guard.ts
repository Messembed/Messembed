import { AuthGuard } from '@nestjs/passport';

export const UserOrExternalServiceAuthGuard = AuthGuard([
  'jwt',
  'cookies',
  'external-service-basic',
]);

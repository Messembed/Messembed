import { AuthGuard } from '@nestjs/passport';

export const JwtOrExternalServiceAuthGuard = AuthGuard([
  'jwt',
  'external-service-basic',
]);

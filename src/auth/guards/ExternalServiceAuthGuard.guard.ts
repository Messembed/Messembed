import { AuthGuard } from '@nestjs/passport';

export const ExternalServiceAuthGuard = AuthGuard('external-service-basic');

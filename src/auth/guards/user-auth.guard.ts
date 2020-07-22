import { AuthGuard } from '@nestjs/passport';

export const UserAuthGuard = AuthGuard(['jwt', 'cookies']);

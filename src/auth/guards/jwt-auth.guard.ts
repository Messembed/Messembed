import { AuthGuard } from '@nestjs/passport';

export const JwtAuthGuard = AuthGuard('jwt');

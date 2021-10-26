import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthAdminController } from './auth.admin-controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ExternalServiceBasicStrategy } from './strategies/external-service-basic.strategy';
import { AuthConfigType, AUTH_CONFIG_KEY } from '../config/auth.config';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (authConfig: AuthConfigType) => ({
        secret: authConfig.jwtStrategy.jwtSecret,
      }),
      inject: [AUTH_CONFIG_KEY],
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, ExternalServiceBasicStrategy],
  controllers: [AuthAdminController],
})
export class AuthModule {}

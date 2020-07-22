import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from '../users/repositories/users.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ExternalServiceBasicStrategy } from './strategies/external-service-basic.strategy';
import { CookiesStrategy } from './strategies/cookies.strategy';
import { AuthConfigType, AUTH_CONFIG_KEY } from '../config/auth.config';
import { ExternalServiceModule } from '../external-service/external-service.module';

@Module({
  imports: [
    ExternalServiceModule,
    TypeOrmModule.forFeature([UsersRepository]),
    JwtModule.registerAsync({
      useFactory: (authConfig: AuthConfigType) => ({
        secret: authConfig.jwtStrategy.jwtSecret,
      }),
      inject: [AUTH_CONFIG_KEY],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    ExternalServiceBasicStrategy,
    CookiesStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}

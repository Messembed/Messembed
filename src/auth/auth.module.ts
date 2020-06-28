import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigType, JWT_CONFIG_KEY } from '../config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from '../users/repositories/Users.repository';
import { JwtStrategy } from './strategies/JwtStrategy.strategy';
import { ExternalServiceBasicStrategy } from './strategies/ExternalServiceBasicStrategy.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersRepository]),
    JwtModule.registerAsync({
      useFactory: (jwtConfig: JwtConfigType) => ({
        secret: jwtConfig.secret,
      }),
      inject: [JWT_CONFIG_KEY],
    }),
  ],
  providers: [AuthService, JwtStrategy, ExternalServiceBasicStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

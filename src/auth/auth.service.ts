import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { AccessTokenDto } from './dto/access-token.dto';
import { JwtAuthTokenPayload } from './interfaces/jwt-auth-token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserMongo, UserMongoDocument } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ErrorGenerator } from '../common/classes/error-generator.class';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async createAccessTokenByUserId(userId: string): Promise<AccessTokenDto> {
    const user = await this.usersService.findOneUserByExternalIdFromMongoOrFail(
      userId,
    );

    return this.createAccessTokenForMongo(user);
  }

  async createAccessToken(user: User): Promise<AccessTokenDto> {
    const payload: JwtAuthTokenPayload = {
      sub: user.id,
    };

    return new AccessTokenDto({
      accessToken: await this.jwtService.signAsync(payload),
    });
  }

  async createAccessTokenForMongo(
    user: UserMongoDocument,
  ): Promise<AccessTokenDto> {
    const payload: JwtAuthTokenPayload = {
      sub: user.id,
    };

    return new AccessTokenDto({
      accessToken: await this.jwtService.signAsync(payload),
    });
  }
}

import { Injectable } from '@nestjs/common';
import { AccessTokenDto } from './dto/access-token.dto';
import { JwtAuthTokenPayload } from './interfaces/jwt-auth-token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UserMongoDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async createAccessTokenByUserId(userId: string): Promise<AccessTokenDto> {
    const user = await this.usersService.findOneUserFromMongoOrFail(userId);

    return this.createAccessTokenForMongo(user);
  }

  async createAccessTokenForMongo(
    user: UserMongoDocument,
  ): Promise<AccessTokenDto> {
    const payload: JwtAuthTokenPayload = {
      sub: user._id,
    };

    return new AccessTokenDto({
      accessToken: await this.jwtService.signAsync(payload),
    });
  }
}

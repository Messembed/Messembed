import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/User.entity';
import { AccessTokenDto } from './dto/AccessToken.dto';
import { JwtAuthTokenPayload } from './interfaces/JwtAuthTokenPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/repositories/Users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepo: UsersRepository,
  ) {}

  async createAccessTokenByExternalId(
    externalId: string,
  ): Promise<AccessTokenDto> {
    const user = await this.usersRepo.findOneOrFailHttp({ externalId });

    return this.createAccessToken(user);
  }

  async createAccessToken(user: User): Promise<AccessTokenDto> {
    const payload: JwtAuthTokenPayload = {
      sub: user.id,
      externalId: user.externalId,
    };

    return new AccessTokenDto({
      accessToken: await this.jwtService.signAsync(payload),
    });
  }
}

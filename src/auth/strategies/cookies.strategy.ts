import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import express from 'express';
import { RequestAuthData } from '../classes/request-auth-data.class';
import axios from 'axios';
import { UsersRepository } from '../../users/repositories/users.repository';
import { Injectable, Inject } from '@nestjs/common';
import { AuthConfigType, AUTH_CONFIG_KEY } from '../../config/auth.config';

@Injectable()
export class CookiesStrategy extends PassportStrategy(Strategy, 'cookies') {
  constructor(
    private readonly usersRepo: UsersRepository,
    @Inject(AUTH_CONFIG_KEY)
    private readonly authConfig: AuthConfigType,
  ) {
    super();
  }

  async validate(req: express.Request): Promise<RequestAuthData> {
    const { data: profile } = await axios.get(
      this.authConfig.cookiesStrategy.verifyUrl,
      {
        headers: {
          cookie: req.headers.cookie,
        },
      },
    );

    const user = await this.usersRepo.findOneOrFail(profile.id);

    return new RequestAuthData({
      user: user,
      externalService: null,
      isExternalService: false,
    });
  }
}

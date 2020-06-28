import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { RequestAuthData } from '../classes/RequestAuthData.class';

export const AuthData = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request>();

  const authData = req['user'] as RequestAuthData;

  return authData;
});

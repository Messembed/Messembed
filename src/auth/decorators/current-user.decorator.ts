import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserDocument } from '../../users/schemas/user.schema';

export const CurrentUser = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const currentUser = req['user'] as UserDocument;

    return currentUser;
  },
);

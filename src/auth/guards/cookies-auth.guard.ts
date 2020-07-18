import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable, ContextType } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IncomingMessage } from 'http';

@Injectable()
export class CookiesAuthGuard extends AuthGuard('cookies') {
  getRequest(context: ExecutionContext): any {
    if (context.getType<ContextType | 'graphql'>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      const request: IncomingMessage = ctx.getContext().req;
      return request;
    }
    return context.switchToHttp().getRequest();
  }
}

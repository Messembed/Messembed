import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class CookiesAuthGuard extends AuthGuard('cookies') {
  getRequest(context: ExecutionContext): any {
    return context.switchToHttp().getRequest();
  }
}

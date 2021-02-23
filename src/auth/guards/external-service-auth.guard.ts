import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ExternalServiceAuthGuard extends AuthGuard(
  'external-service-basic',
) {
  getRequest(context: ExecutionContext): any {
    return context.switchToHttp().getRequest();
  }
}

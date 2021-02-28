import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExternalServiceAuthGuard extends AuthGuard(
  'external-service-basic',
) {}

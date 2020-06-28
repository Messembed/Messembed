import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ExternalServiceGuard extends AuthGuard('external-service-basic') {}

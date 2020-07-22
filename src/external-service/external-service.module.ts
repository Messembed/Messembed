import { Module } from '@nestjs/common';
import { ExternalServiceService } from './external-service.service';

@Module({
  providers: [ExternalServiceService],
  exports: [ExternalServiceService],
})
export class ExternalServiceModule {}

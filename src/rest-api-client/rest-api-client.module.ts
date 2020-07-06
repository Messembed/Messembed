import { Module } from '@nestjs/common';
import { APP_CONFIG_KEY, AppConfigType } from '../config/app.config';
import { LabadoMessengerSdk } from './labado-messenger.sdk';

@Module({
  providers: [
    {
      provide: LabadoMessengerSdk,
      useFactory: (appConfig: AppConfigType): LabadoMessengerSdk => {
        return new LabadoMessengerSdk(appConfig.appUrl);
      },
      inject: [APP_CONFIG_KEY],
    },
  ],
  exports: [LabadoMessengerSdk],
})
export class RestApiClientModule {}

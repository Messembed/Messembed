import { forwardRef, Module } from '@nestjs/common';
import { UpdatesService } from './updates.service';
import { UpdatesController } from './updates.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UpdateModel, UpdateSchema } from './schemas/update.schema';
import { ChatsModule } from '../chats/chats.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthConfigType, AUTH_CONFIG_KEY } from '../config/auth.config';
import { UpdatesGateway } from './updates.gateway';
import { MessagesModule } from '../messages/messages.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => ChatsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => MessagesModule),
    MongooseModule.forFeature([
      { name: UpdateModel.name, schema: UpdateSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: (authConfig: AuthConfigType) => ({
        secret: authConfig.jwtStrategy.jwtSecret,
      }),
      inject: [AUTH_CONFIG_KEY],
    }),
  ],
  providers: [UpdatesService, UpdatesGateway],
  controllers: [UpdatesController],
  exports: [UpdatesService],
})
export class UpdatesModule {}

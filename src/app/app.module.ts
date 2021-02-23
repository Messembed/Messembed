import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from '../config';
import { ChatsModule } from '../chats/chats.module';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { AuthModule } from '../auth/auth.module';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MONGODB_CONFIG_KEY,
  MongoDBConfigType,
} from '../config/mongodb.config';
import { UpdatesModule } from '../updates/updates.module';

@Module({
  imports: [
    AuthModule,
    ChatsModule,
    UsersModule,
    MessagesModule,
    UpdatesModule,
    MongooseModule.forRootAsync({
      useFactory: (mongodbConfig: MongoDBConfigType) => ({
        uri: mongodbConfig.uri,
      }),
      inject: [MONGODB_CONFIG_KEY],
    }),
    ConfigModule.forRoot(configModuleOptions),
  ],
  controllers: [AppController],
})
export class AppModule {}

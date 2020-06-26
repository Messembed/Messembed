import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from '../config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsModule } from '../chats/chats.module';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    ChatsModule,
    UsersModule,
    MessagesModule,
    TypeOrmModule.forRoot(),
    ConfigModule.forRoot(configModuleOptions),
  ],
})
export class AppModule {}

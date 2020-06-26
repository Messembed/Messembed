import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from '../config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsModule } from '../chats/chats.module';

@Module({
  imports: [
    ChatsModule,
    TypeOrmModule.forRoot(),
    ConfigModule.forRoot(configModuleOptions),
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesRepository } from './repositories/Messages.repository';
import { ChatsRepository } from '../chats/repositories/Chats.repository';
import { ChatsModule } from '../chats/chats.module';

@Module({
  imports: [
    ChatsModule,
    TypeOrmModule.forFeature([MessagesRepository, ChatsRepository]),
  ],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}

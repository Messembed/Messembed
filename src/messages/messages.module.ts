import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesRepository } from './repositories/Messages.repository';
import { ChatsRepository } from '../chats/repositories/Chats.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MessagesRepository, ChatsRepository])],
  providers: [MessagesService, MessagesRepository],
  controllers: [MessagesController],
  exports: [MessagesService, MessagesRepository],
})
export class MessagesModule {}

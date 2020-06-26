import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRepository } from './repositories/chat.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRepository])],
  providers: [ChatsService],
})
export class ChatsModule {}

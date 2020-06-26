import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRepository } from './repositories/chat.repository';
import { ChatsController } from './chats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRepository])],
  providers: [ChatsService],
  controllers: [ChatsController],
})
export class ChatsModule {}

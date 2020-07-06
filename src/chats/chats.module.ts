import { Module, forwardRef } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsRepository } from './repositories/chats.repository';
import { ChatsController } from './chats.controller';
import { UsersModule } from '../users/users.module';
import { UsersRepository } from '../users/repositories/users.repository';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => MessagesModule),
    TypeOrmModule.forFeature([ChatsRepository, UsersRepository]),
  ],
  providers: [ChatsService],
  controllers: [ChatsController],
  exports: [ChatsService],
})
export class ChatsModule {}

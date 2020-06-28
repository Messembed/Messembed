import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsRepository } from './repositories/Chats.repository';
import { ChatsController } from './chats.controller';
import { UsersModule } from '../users/users.module';
import { UsersRepository } from '../users/repositories/Users.repository';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([ChatsRepository, UsersRepository]),
  ],
  providers: [ChatsService],
  controllers: [ChatsController],
  exports: [ChatsService],
})
export class ChatsModule {}
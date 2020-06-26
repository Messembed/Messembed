import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesRepository } from './repositories/Messages.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MessagesRepository])],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}

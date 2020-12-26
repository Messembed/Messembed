import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesRepository } from './repositories/messages.repository';
import { ChatsRepository } from '../chats/repositories/chats.repository';
import { ChatsModule } from '../chats/chats.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageMongo, MessageMongoSchema } from './schemas/message.schema';

@Module({
  imports: [
    forwardRef(() => ChatsModule),
    TypeOrmModule.forFeature([MessagesRepository, ChatsRepository]),
    MongooseModule.forFeature([
      { name: MessageMongo.name, schema: MessageMongoSchema },
    ]),
  ],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}

import { Module, forwardRef } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatMongo, ChatMongoSchema } from './schemas/chat.schema';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => MessagesModule),
    MongooseModule.forFeature([
      { name: ChatMongo.name, schema: ChatMongoSchema },
    ]),
  ],
  providers: [ChatsService],
  controllers: [ChatsController],
  exports: [ChatsService],
})
export class ChatsModule {}

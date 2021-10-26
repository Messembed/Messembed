import { Module, forwardRef } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { ChatsAdminController } from './chats.admin-controller';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModel, ChatSchema } from './schemas/chat.schema';
import { UpdatesModule } from '../updates/updates.module';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => MessagesModule),
    forwardRef(() => UpdatesModule),
    MongooseModule.forFeature([{ name: ChatModel.name, schema: ChatSchema }]),
  ],
  providers: [ChatsService],
  controllers: [ChatsController, ChatsAdminController],
  exports: [ChatsService],
})
export class ChatsModule {}

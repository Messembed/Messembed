import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { ChatsModule } from '../chats/chats.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModel, MessageSchema } from './schemas/message.schema';
import { MessagesAdminController } from './messages.admin-controller';
import { UpdatesModule } from '../updates/updates.module';

@Module({
  imports: [
    forwardRef(() => ChatsModule),
    forwardRef(() => UpdatesModule),
    MongooseModule.forFeature([
      { name: MessageModel.name, schema: MessageSchema },
    ]),
  ],
  providers: [MessagesService],
  controllers: [MessagesController, MessagesAdminController],
  exports: [MessagesService],
})
export class MessagesModule {}

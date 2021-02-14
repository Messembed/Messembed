import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { ChatsModule } from '../chats/chats.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageMongo, MessageMongoSchema } from './schemas/message.schema';
import { MessagesAdminController } from './messages.admin-controller';
import { UpdatesModule } from '../updates/updates.module';

@Module({
  imports: [
    forwardRef(() => ChatsModule),
    forwardRef(() => UpdatesModule),
    MongooseModule.forFeature([
      { name: MessageMongo.name, schema: MessageMongoSchema },
    ]),
  ],
  providers: [MessagesService],
  controllers: [MessagesController, MessagesAdminController],
  exports: [MessagesService],
})
export class MessagesModule {}

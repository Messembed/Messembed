import { forwardRef, Module } from '@nestjs/common';
import { UpdatesService } from './updates.service';
import { UpdatesController } from './updates.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Update, UpdateSchema } from './schemas/update.schema';
import { ChatsModule } from '../chats/chats.module';

@Module({
  imports: [
    forwardRef(() => ChatsModule),
    MongooseModule.forFeature([{ name: Update.name, schema: UpdateSchema }]),
  ],
  providers: [UpdatesService],
  controllers: [UpdatesController],
  exports: [UpdatesService],
})
export class UpdatesModule {}

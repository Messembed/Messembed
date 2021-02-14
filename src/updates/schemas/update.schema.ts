import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import {
  ChatMongoDocument,
  ChatMongoSchema,
} from '../../chats/schemas/chat.schema';
import {
  MessageMongoDocument,
  MessageMongoSchema,
} from '../../messages/schemas/message.schema';

export type UpdateDocument = Update & Document;

@Schema({
  minimize: false,
})
export class Update {
  _id: Types.ObjectId;

  @Prop({ type: Date, required: true, index: true })
  createdAt: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMongo',
    required: true,
    index: true,
  })
  chatId: Types.ObjectId;

  @Prop({ type: String, required: true })
  type: 'new_message' | 'new_chat';

  /**
   * present, if type = 'new_message'
   */
  @Prop({ type: MessageMongoSchema, required: false })
  message?: MessageMongoDocument;

  /**
   * present, if type = 'new_chat'
   */
  @Prop({ type: ChatMongoSchema, required: false })
  chat?: ChatMongoDocument;
}

export const UpdateSchema = SchemaFactory.createForClass(Update);

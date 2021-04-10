import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { ChatDocument, ChatSchema } from '../../chats/schemas/chat.schema';
import {
  MessageDocument,
  MessageSchema,
} from '../../messages/schemas/message.schema';

export type UpdateDocument = UpdateModel & Document;

@Schema({
  minimize: false,
  collection: 'updates',
})
export class UpdateModel {
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
  @Prop({ type: MessageSchema, required: false })
  message?: MessageDocument;

  /**
   * present, if type = 'new_chat'
   */
  @Prop({ type: ChatSchema, required: false })
  chat?: ChatDocument;
}

export const UpdateSchema = SchemaFactory.createForClass(UpdateModel);

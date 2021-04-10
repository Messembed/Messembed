import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = MessageModel & Document;

@Schema({
  minimize: false,
})
export class MessageModel {
  @Prop({ type: Date, required: true })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: Date })
  deletedAt?: Date | null;

  @Prop({ type: Date })
  editedAt?: Date | null;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ChatMongo' })
  chat: Types.ObjectId;

  @Prop({ type: String, ref: 'UserMongo' })
  user: string;

  @Prop({ type: String, index: 'text' })
  content: string;

  @Prop({ type: Boolean })
  read: boolean;

  @Prop({ type: Object })
  externalMetadata?: Record<string, unknown> | null;

  @Prop({ type: Object })
  privateExternalMetadata?: Record<string, unknown> | null;
}

export const MessageSchema = SchemaFactory.createForClass(MessageModel);

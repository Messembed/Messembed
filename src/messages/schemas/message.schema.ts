import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';

export type MessageMongoDocument = MessageMongo & Document;

@Schema({
  minimize: false,
})
export class MessageMongo {
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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserMongo' })
  user: Types.ObjectId;

  @Prop({ type: String })
  content: string;

  @Prop({ type: Boolean })
  read: boolean;

  @Prop({ type: Object })
  externalMetadata?: Record<string, unknown> | null;

  @Prop({ type: Object })
  privateExternalMetadata?: Record<string, unknown> | null;
}

export const MessageMongoSchema = SchemaFactory.createForClass(MessageMongo);
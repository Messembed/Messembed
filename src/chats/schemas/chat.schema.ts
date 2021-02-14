import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  MessageMongoDocument,
  MessageMongoSchema,
} from '../../messages/schemas/message.schema';
import {
  UserMongoDocument,
  UserMongoSchema,
} from '../../users/schemas/user.schema';

export type ChatMongoDocument = ChatMongo & Document;

@Schema({
  minimize: false,
})
export class ChatMongo {
  _id: Types.ObjectId;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: Date })
  deletedAt?: Date | null;

  @Prop({ type: String })
  title?: string;

  @Prop({ type: Boolean })
  active: boolean;

  @Prop({ type: Object })
  externalMetadata?: Record<string, unknown> | null;

  @Prop({ type: Object })
  privateExternalMetadata?: Record<string, unknown> | null;

  @Prop({ type: UserMongoSchema })
  firstCompanion: UserMongoDocument;

  @Prop({ type: UserMongoSchema })
  secondCompanion: UserMongoDocument;

  @Prop({ type: MessageMongoSchema })
  lastMessage?: MessageMongoDocument;

  @Prop({ type: Number, default: 0 })
  notReadByFirstCompanionMessagesCount?: number;

  @Prop({ type: Number, default: 0 })
  notReadBySecondCompanionMessagesCount?: number;
}

export const ChatMongoSchema = SchemaFactory.createForClass(ChatMongo);

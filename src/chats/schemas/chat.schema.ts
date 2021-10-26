import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  MessageDocument,
  MessageSchema,
} from '../../messages/schemas/message.schema';
import { UserDocument, UserSchema } from '../../users/schemas/user.schema';

export type ChatDocument = ChatModel & Document;

@Schema({
  minimize: false,
  collection: 'chatmongos',
})
export class ChatModel {
  _id: Types.ObjectId;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: Date })
  deletedAt?: Date | null;

  @Prop({ type: Boolean })
  active: boolean;

  @Prop({ type: Object })
  externalMetadata?: Record<string, unknown> | null;

  @Prop({ type: Object })
  privateExternalMetadata?: Record<string, unknown> | null;

  @Prop({ type: UserSchema })
  firstCompanion: UserDocument;

  @Prop({ type: UserSchema })
  secondCompanion: UserDocument;

  @Prop({ type: MessageSchema })
  lastMessage?: MessageDocument;

  @Prop({ type: Number, default: 0 })
  notReadByFirstCompanionMessagesCount?: number;

  @Prop({ type: Number, default: 0 })
  notReadBySecondCompanionMessagesCount?: number;
}

export const ChatSchema = SchemaFactory.createForClass(ChatModel);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MessageMongo } from '../../messages/schemas/message.schema';
import { UserMongo, UserMongoSchema } from '../../users/schemas/user.schema';

export type ChatMongoDocument = ChatMongo & Document;

@Schema({
  minimize: false,
})
export class ChatMongo {
  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: Date })
  deletedAt?: Date | null;

  @Prop({ type: String })
  title: string;

  @Prop({ type: Boolean })
  active: boolean;

  @Prop({ type: Object })
  externalMetadata?: Record<string, unknown> | null;

  @Prop({ type: Object })
  privateExternalMetadata?: Record<string, unknown> | null;

  @Prop({ type: UserMongoSchema })
  firstCompanion: UserMongo;

  @Prop({ type: UserMongoSchema })
  secondCompanion: UserMongo;

  @Prop({ type: Object })
  lastMessage?: MessageMongo;
}

export const ChatMongoSchema = SchemaFactory.createForClass(ChatMongo);

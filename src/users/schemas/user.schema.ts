import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserMongoDocument = UserMongo & Document;

@Schema({
  minimize: false,
})
export class UserMongo {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true, unique: true })
  externalId: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Object })
  externalMetadata?: Record<string, unknown> | null;

  @Prop({ type: Object })
  privateExternalMetadata?: Record<string, unknown> | null;
}

export const UserMongoSchema = SchemaFactory.createForClass(UserMongo);

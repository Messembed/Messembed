import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface UserDocument extends UserModel, Document {
  _id: string;
}

@Schema({
  minimize: false,
  collection: 'usermongos',
})
export class UserModel {
  @Prop({ type: String })
  _id: string;

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

  @Prop({ type: String, required: false })
  blockStatus?: 'CANT_SEND_AND_RECEIVE_NEW_MESSAGES' | null;

  @Prop({ type: Date, required: false })
  blockStatusUpdatedAt?: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

import { Types } from 'mongoose';

export interface CreateMessageInMongoOptions {
  content: string;
  externalMetadata?: Record<string, unknown>;
  privateExternalMetadata?: Record<string, unknown>;
  userId: Types.ObjectId;
  chatId: Types.ObjectId;
}

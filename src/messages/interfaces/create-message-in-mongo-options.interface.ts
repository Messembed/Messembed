import { Types } from 'mongoose';

export interface CreateMessageInMongoOptions {
  content: string;
  externalMetadata?: Record<string, unknown>;
  privateExternalMetadata?: Record<string, unknown>;
  userId: string;
  chatId: Types.ObjectId;
}

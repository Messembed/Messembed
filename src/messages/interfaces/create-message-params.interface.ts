import { Types } from 'mongoose';

export interface CreateMessageParams {
  content: string;
  attachments?: Record<string, unknown>[];
  externalMetadata?: Record<string, unknown>;
  privateExternalMetadata?: Record<string, unknown>;
  userId: string;
  chatId: Types.ObjectId;
}

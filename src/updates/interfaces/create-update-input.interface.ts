import { Types } from 'mongoose';
import { ChatMongoDocument } from '../../chats/schemas/chat.schema';
import { MessageMongoDocument } from '../../messages/schemas/message.schema';

export interface CreateUpdateInput {
  chatId: Types.ObjectId;
  type: 'new_message' | 'new_chat';
  message?: MessageMongoDocument;
  chat?: ChatMongoDocument;
}

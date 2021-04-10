import { Types } from 'mongoose';
import { ChatDocument } from '../../chats/schemas/chat.schema';
import { MessageDocument } from '../../messages/schemas/message.schema';

export interface CreateUpdateInput {
  chatId: Types.ObjectId;
  type: 'new_message' | 'new_chat';
  message?: MessageDocument;
  chat?: ChatDocument;
}

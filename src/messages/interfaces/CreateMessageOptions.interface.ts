export interface CreateMessageOptions {
  content: string;
  externalMetadata: Record<string, unknown>;
  userId: string;
  chatId: number;
}

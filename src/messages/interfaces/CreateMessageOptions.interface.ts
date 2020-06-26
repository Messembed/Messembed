export interface CreateMessageOptions {
  content: string;
  externalMetadata: Record<string, unknown>;
  userId: number;
  chatId: number;
}

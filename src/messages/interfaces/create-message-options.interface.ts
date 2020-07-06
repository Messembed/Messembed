export interface CreateMessageOptions {
  content: string;
  externalMetadata?: Record<string, unknown>;
  privateExternalMetadata?: Record<string, unknown>;
  userId: string;
  chatId: number;
}

import { Module } from '@nestjs/common';
import { ChatsQueryResolver } from './chats/chats.query.resolver';
import { ChatsMutationResolver } from './chats/chats.mutation.resolver';
import { RestApiClientModule } from '../rest-api-client/rest-api-client.module';

@Module({
  imports: [RestApiClientModule],
  providers: [ChatsQueryResolver, ChatsMutationResolver],
})
export class GraphqlApiModule {}

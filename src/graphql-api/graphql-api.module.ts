import { Module } from '@nestjs/common';
import { ChatsQueryResolver } from './chats/chats.query.resolver';
import { ChatsMutationResolver } from './chats/chats.mutation.resolver';
import { RestApiClientModule } from '../rest-api-client/rest-api-client.module';
import { UsersMutationResolver } from './users/users.mutation.resolver';
import { UsersQueryResolver } from './users/users.query.resolver';
import { MessagesMutationResolver } from './messages/messages.mutation.resolver';
import { MessagesQueryResolver } from './messages/messages.query.resolver';
import { AuthMutationResolver } from './auth/auth.mutation.resolver';

@Module({
  imports: [RestApiClientModule],
  providers: [
    AuthMutationResolver,
    ChatsQueryResolver,
    ChatsMutationResolver,
    UsersQueryResolver,
    UsersMutationResolver,
    MessagesQueryResolver,
    MessagesMutationResolver,
  ],
})
export class GraphqlApiModule {}

import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { ChatsConnectionGqlType } from './gql-types/chats-connection.gql-type';
import { LabadoMessengerSdk } from '../rest-api-client/labado-messenger.sdk';
import { ChatGqlType } from './gql-types/chat.gql-type';
import { GqlHeaders } from './decorators/gql-headers.decorator';

@Resolver('GraphqlApi')
export class GraphqlApiResolver {
  constructor(private readonly labadoMessengerSdk: LabadoMessengerSdk) {}

  @Query(() => ChatsConnectionGqlType)
  async chatsConnection(
    @GqlHeaders('authorization') authHeader: string,
  ): Promise<ChatsConnectionGqlType> {
    const paginatedChats = await this.labadoMessengerSdk.getAllChats(
      authHeader,
    );

    return {
      nodes: paginatedChats.data,
      totalCount: paginatedChats.totalCount,
    };
  }

  @Query(() => ChatGqlType)
  chat(
    @GqlHeaders('authorization') authHeader: string,
    @Args('chatId', { type: () => ID }) chatId: string,
  ): Promise<ChatGqlType> {
    return this.labadoMessengerSdk.getChat(chatId, authHeader);
  }
}

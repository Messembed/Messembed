import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { ChatsConnectionGqlType } from './gql-types/chats-connection.gql-type';
import { LabadoMessengerSdk } from '../../rest-api-client/labado-messenger.sdk';
import { ChatGqlType } from './gql-types/chat.gql-type';
import { GqlHeaders } from '../decorators/gql-headers.decorator';
import { PersonalChatGqlType } from './gql-types/personal-chat.gql-type';

@Resolver()
export class ChatsQueryResolver {
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

  @Query(() => [PersonalChatGqlType])
  personalChats(
    @GqlHeaders('authorization') authHeader: string,
  ): Promise<PersonalChatGqlType[]> {
    return this.labadoMessengerSdk.getPersonalChats(authHeader);
  }
}

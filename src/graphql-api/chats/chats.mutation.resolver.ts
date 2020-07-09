import { Resolver, Args, Mutation } from '@nestjs/graphql';
import { LabadoMessengerSdk } from '../../rest-api-client/labado-messenger.sdk';
import { ChatGqlType } from './gql-types/chat.gql-type';
import { GqlHeaders } from '../decorators/gql-headers.decorator';
import { CreateChatGqlInput } from './gql-inputs/create-chat.gql-input';

@Resolver()
export class ChatsMutationResolver {
  constructor(private readonly labadoMessengerSdk: LabadoMessengerSdk) {}

  @Mutation(() => ChatGqlType)
  createChat(
    @Args('data') data: CreateChatGqlInput,
    @GqlHeaders('Authorization') authHeader: string,
  ): Promise<ChatGqlType> {
    return this.labadoMessengerSdk.createChat(data, authHeader);
  }
}

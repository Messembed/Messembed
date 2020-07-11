import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { LabadoMessengerSdk } from '../../rest-api-client/labado-messenger.sdk';
import { GqlHeaders } from '../decorators/gql-headers.decorator';
import { MessageGqlType } from './gql-types/message.gql-type';
import { CreateMessageGqlInput } from './gql-inputs/create-message.gql-input';

@Resolver('MessagesMutationResolver')
export class MessagesMutationResolver {
  constructor(private readonly labadoMessengerSdk: LabadoMessengerSdk) {}

  @Mutation(() => MessageGqlType)
  createMessage(
    @Args('data') data: CreateMessageGqlInput,
    @GqlHeaders('Authorization') authHeader: string,
  ): Promise<MessageGqlType> {
    return this.labadoMessengerSdk.createMessage(data, authHeader);
  }
}

import { Resolver, Query, Args } from '@nestjs/graphql';
import { LabadoMessengerSdk } from '../../rest-api-client/labado-messenger.sdk';
import { GqlHeaders } from '../decorators/gql-headers.decorator';
import { MessagesFiltersGqlInput } from './gql-inputs/messages-filters.gql-input';
import { MessagesConnectionGqlType } from './gql-types/messages-connection.gql-type';

@Resolver('MessagesQueryResolver')
export class MessagesQueryResolver {
  constructor(private readonly labadoMessengerSdk: LabadoMessengerSdk) {}

  @Query(() => MessagesConnectionGqlType)
  messages(
    @Args('filters') filters: MessagesFiltersGqlInput,
    @GqlHeaders('Authorization') authHeader: string,
  ): Promise<MessagesConnectionGqlType> {
    return this.labadoMessengerSdk.findMessages(filters, authHeader);
  }
}

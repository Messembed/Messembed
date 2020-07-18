import { Resolver, Args, Mutation, ID } from '@nestjs/graphql';
import { LabadoMessengerSdk } from '../../rest-api-client/labado-messenger.sdk';
import { GqlHeaders } from '../decorators/gql-headers.decorator';
import { AccessTokenGqlType } from './gql-types/access-token.gql-type';

@Resolver()
export class AuthMutationResolver {
  constructor(private readonly labadoMessengerSdk: LabadoMessengerSdk) {}

  @Mutation(() => AccessTokenGqlType)
  createAccessToken(
    @Args('userId', { type: () => ID }) userId: string,
    @GqlHeaders('Authorization') authHeader: string,
  ): Promise<AccessTokenGqlType> {
    return this.labadoMessengerSdk.createAccessToken(userId, authHeader);
  }
}

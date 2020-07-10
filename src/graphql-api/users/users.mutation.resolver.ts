import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { LabadoMessengerSdk } from '../../rest-api-client/labado-messenger.sdk';
import { UserGqlType } from './gql-types/user.gql-type';
import { CreateUserGqlInput } from './gql-inputs/create-user.gql-input';
import { GqlHeaders } from '../decorators/gql-headers.decorator';

@Resolver('UsersMutationResolver')
export class UsersMutationResolver {
  constructor(private readonly labadoMessengerSdk: LabadoMessengerSdk) {}

  @Mutation(() => UserGqlType)
  createUser(
    @Args('data') data: CreateUserGqlInput,
    @GqlHeaders('Authorization') authHeader: string,
  ): Promise<UserGqlType> {
    return this.labadoMessengerSdk.createUser(data, authHeader);
  }
}

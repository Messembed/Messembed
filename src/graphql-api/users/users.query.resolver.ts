import { Resolver, Query } from '@nestjs/graphql';
import { LabadoMessengerSdk } from '../../rest-api-client/labado-messenger.sdk';
import { UserGqlType } from './gql-types/user.gql-type';
import { GqlHeaders } from '../decorators/gql-headers.decorator';

@Resolver('UsersQueryResolver')
export class UsersQueryResolver {
  constructor(private readonly labadoMessengerSdk: LabadoMessengerSdk) {}

  @Query(() => UserGqlType)
  me(@GqlHeaders('Authorization') authHeader: string): Promise<UserGqlType> {
    return this.labadoMessengerSdk.getMe(authHeader);
  }
}

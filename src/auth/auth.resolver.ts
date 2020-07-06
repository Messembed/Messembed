import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { AccessTokenGraphQLType } from './graphql-types/access-token.graphql-type';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { ExternalServiceAuthGuard } from './guards/external-service-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AccessTokenGraphQLType)
  @UseGuards(ExternalServiceAuthGuard)
  createAccessToken(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<AccessTokenGraphQLType> {
    return this.authService.createAccessTokenByUserId(userId);
  }
}

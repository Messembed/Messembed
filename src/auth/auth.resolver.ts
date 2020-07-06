import { Resolver, Mutation, Args, Query, ID } from '@nestjs/graphql';
import { AccessTokenGraphQLType } from './graphql-types/access-token.graphql-type';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { ExternalServiceAuthGuard } from './guards/ExternalServiceAuthGuard.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String)
  ping(): string {
    return 'pong';
  }

  @Mutation(() => AccessTokenGraphQLType)
  @UseGuards(ExternalServiceAuthGuard)
  createAccessToken(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<AccessTokenGraphQLType> {
    return this.authService.createAccessTokenByUserId(userId);
  }
}

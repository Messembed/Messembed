import { Resolver, Query } from '@nestjs/graphql';

@Resolver('App')
export class AppResolver {
  @Query(() => String)
  ping(): string {
    return 'pong';
  }
}

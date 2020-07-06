import { Module } from '@nestjs/common';
import { GraphqlApiResolver } from './graphql-api.resolver';

@Module({
  providers: [GraphqlApiResolver]
})
export class GraphqlApiModule {}

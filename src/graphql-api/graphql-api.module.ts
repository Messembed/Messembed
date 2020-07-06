import { Module } from '@nestjs/common';
import { GraphqlApiResolver } from './graphql-api.resolver';
import { RestApiClientModule } from '../rest-api-client/rest-api-client.module';

@Module({
  imports: [RestApiClientModule],
  providers: [GraphqlApiResolver],
})
export class GraphqlApiModule {}

import { Resolver, Query } from '@nestjs/graphql';
import { PaginatedChatsGqlType } from './gql-types/paginated-chats.gql-type';

@Resolver('GraphqlApi')
export class GraphqlApiResolver {
  @Query(() => PaginatedChatsGqlType)
  async getAllChats(): Promise<PaginatedChatsGqlType> {
    return { chats: [] };
  }
}

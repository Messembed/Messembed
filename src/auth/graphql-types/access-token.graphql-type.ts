import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AccessTokenGraphQLType {
  @Field({ description: 'Access token' })
  accessToken: string;
}

import { ObjectType, Field, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class UserGqlType {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt?: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  externalMetadata?: Record<string, any>;

  @Field(() => GraphQLJSON, { nullable: true })
  privateExternalMetadata?: Record<string, any>;
}

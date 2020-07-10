import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateUserGqlInput {
  @Field()
  id: string;

  @Field(() => GraphQLJSON)
  externalMetadata?: Record<string, any>;

  @Field(() => GraphQLJSON)
  privateExternalMetadata?: Record<string, any>;
}

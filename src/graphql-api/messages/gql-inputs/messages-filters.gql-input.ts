import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class MessagesFiltersGqlInput {
  @Field(() => Int)
  chatId: number;

  @Field(() => Int, { nullable: true })
  afterId?: number;

  @Field(() => Int, { nullable: true })
  beforeId?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;

  @Field(() => Int, { nullable: true })
  limit?: number;
}

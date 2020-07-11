import { Test, TestingModule } from '@nestjs/testing';
import { MessagesMutationResolver } from './messages.mutation.resolver';

describe('MessagesMutationResolver', () => {
  let resolver: MessagesMutationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesMutationResolver],
    }).compile();

    resolver = module.get<MessagesMutationResolver>(MessagesMutationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

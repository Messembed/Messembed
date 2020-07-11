import { Test, TestingModule } from '@nestjs/testing';
import { MessagesQueryResolver } from './messages.query.resolver';

describe('MessagesQueryResolver', () => {
  let resolver: MessagesQueryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesQueryResolver],
    }).compile();

    resolver = module.get<MessagesQueryResolver>(MessagesQueryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

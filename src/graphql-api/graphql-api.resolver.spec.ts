import { Test, TestingModule } from '@nestjs/testing';
import { GraphqlApiResolver } from './graphql-api.resolver';

describe('GraphqlApiResolver', () => {
  let resolver: GraphqlApiResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphqlApiResolver],
    }).compile();

    resolver = module.get<GraphqlApiResolver>(GraphqlApiResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

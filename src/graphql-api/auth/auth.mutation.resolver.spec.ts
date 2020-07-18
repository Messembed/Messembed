import { Test, TestingModule } from '@nestjs/testing';
import { AuthMutationResolver } from './auth.mutation.resolver';

describe('AuthMutationResolver', () => {
  let resolver: AuthMutationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthMutationResolver],
    }).compile();

    resolver = module.get<AuthMutationResolver>(AuthMutationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

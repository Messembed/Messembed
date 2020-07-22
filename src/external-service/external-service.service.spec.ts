import { Test, TestingModule } from '@nestjs/testing';
import { ExternalServiceService } from './external-service.service';

describe('ExternalServiceService', () => {
  let service: ExternalServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExternalServiceService],
    }).compile();

    service = module.get<ExternalServiceService>(ExternalServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

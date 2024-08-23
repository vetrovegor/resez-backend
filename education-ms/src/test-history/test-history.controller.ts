import { Controller } from '@nestjs/common';
import { TestHistoryService } from './test-history.service';

@Controller('test-history')
export class TestHistoryController {
  constructor(private readonly testHistoryService: TestHistoryService) {}
}

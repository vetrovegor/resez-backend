import { Controller } from '@nestjs/common';
import { ScoreConversionService } from './score-conversion.service';

@Controller('score-conversion')
export class ScoreConversionController {
  constructor(private readonly scoreConversionService: ScoreConversionService) {}
}

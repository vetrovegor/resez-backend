import { Controller } from '@nestjs/common';
import { SubThemeService } from './sub-theme.service';

@Controller('sub-theme')
export class SubThemeController {
  constructor(private readonly subThemeService: SubThemeService) {}
}

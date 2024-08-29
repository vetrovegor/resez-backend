import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Query
} from '@nestjs/common';
import { SubThemeService } from './sub-theme.service';
import { Public } from '@auth/decorators/public.decorator';

@Public()
@Controller('sub-theme')
export class SubThemeController {
    constructor(private readonly subThemeService: SubThemeService) {}

    @Get(':id')
    async getInfoById(@Param('id', ParseIntPipe) id: number) {
        return await this.subThemeService.getInfoById(id);
    }

    @Get(':id/task')
    async getTasksBySubthemeId(
        @Param('id', ParseIntPipe) id: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
    ) {
        return await this.subThemeService.findTasksBySubthemeId(
            id,
            limit,
            offset
        );
    }
}

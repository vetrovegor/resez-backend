import { Controller, Get } from '@nestjs/common';
import { SourceService } from './source.service';
import { Public } from '@auth/decorators/public.decorator';
import { ApiResponse } from '@nestjs/swagger';
import { SourcesResponseDto } from './dto/source-response.dto';

@Public()
@Controller('source')
export class SourceController {
    constructor(private readonly sourceService: SourceService) {}

    @Get()
    @ApiResponse({
        status: 200,
        description: 'Success',
        type: SourcesResponseDto
    })
    async find() {
        return await this.sourceService.find();
    }
}

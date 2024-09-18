import { CollectionService } from '@collection/collection.service';
import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Query
} from '@nestjs/common';

@Controller('admin')
export class AdminController {
    constructor(private readonly collectionService: CollectionService) {}

    @Get('user/:id/collection')
    async findAll(
        @Param('id') userId: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        @Query('search') search: string
    ) {
        return await this.collectionService.findAll(
            userId,
            limit,
            offset,
            userId,
            search
        );
    }
}

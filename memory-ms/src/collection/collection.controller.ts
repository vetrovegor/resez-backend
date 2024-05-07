import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionDto } from './dto/collection.dto';
import { CurrentUser } from '@auth/current-user.decorator';
import { JwtPayload } from '@auth/interfaces';

@Controller('collection')
export class CollectionController {
    constructor(private readonly collectionService: CollectionService) {}

    @Post()
    async create(@CurrentUser() user: JwtPayload, @Body() dto: CollectionDto) {
        return await this.collectionService.create(user.id, dto);
    }

    @Get()
    async findAll(
        @CurrentUser() user: JwtPayload,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
    ) {
        return await this.collectionService.findAll(user.id, limit, offset);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.collectionService.findOne(id, user.id);
    }

    @Get(':id/cards')
    async getCards(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.collectionService.getCards(id, user.id);
    }

    @Get(':id/test')
    async getTest(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.collectionService.getTest(id, user.id);
    }

    @Get(':id/match')
    async getMatches(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.collectionService.getMatches(id, user.id);
    }

    @Delete(':id')
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.collectionService.delete(id, user.id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload,
        @Body() dto: CollectionDto
    ) {
        return await this.collectionService.update(id, user.id, dto);
    }
}

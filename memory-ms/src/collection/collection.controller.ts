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
    Query,
    UseGuards
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionDto } from './dto/collection.dto';
import { CurrentUser } from '@auth/current-user.decorator';
import { JwtPayload } from '@auth/interfaces';
import { SeedPipe } from './seed.pipe';
import { Public } from '@auth/public.decorator';
import { OptionalJwtAuthGuard } from '@auth/optional-jwt-auth.guard';

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
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        @Query('targetUserId', new ParseIntPipe({ optional: true }))
        targetUserId: number,
        @Query('search') search: string
    ) {
        return await this.collectionService.findAll(
            user.id,
            limit,
            offset,
            targetUserId,
            search
        );
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get('user/:nickname')
    async findByNickname(
        @CurrentUser() user: JwtPayload,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        @Param('nickname') nickname: string,
        @Query('search') search: string
    ) {
        return await this.collectionService.findByNickname(
            user.id,
            limit,
            offset,
            nickname,
            search
        );
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get('popular')
    async findPopular(@CurrentUser() user: JwtPayload) {
        return await this.collectionService.findPopular(user?.id);
    }

    @Get('liked')
    async findLiked(
        @CurrentUser() user: JwtPayload,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        @Query('search') search: string
    ) {
        return await this.collectionService.findLiked(
            user.id,
            limit,
            offset,
            search
        );
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.collectionService.findOne(id, user.id);
    }

    @Get(':id/pairs')
    async findPairs(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        @Query('search') search: string
    ) {
        return await this.collectionService.findPairs(
            id,
            user.id,
            limit,
            offset,
            search
        );
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/cards')
    async findCards(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        @Query('seed', new SeedPipe()) seed: number
    ) {
        return await this.collectionService.findCards(
            id,
            user.id,
            limit,
            offset,
            seed
        );
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
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

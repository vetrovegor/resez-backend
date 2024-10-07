import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MatchScoreService } from './match-score.service';
import { CurrentUser } from '@auth/current-user.decorator';
import { JwtPayload } from '@auth/interfaces';
import { MatchDto } from './dto/match.dto';
import { Public } from '@auth/public.decorator';
import { OptionalJwtAuthGuard } from '@auth/optional-jwt-auth.guard';

@Controller('match-score')
export class MatchScoreController {
    constructor(private readonly matchScoreService: MatchScoreService) {}

    @Post()
    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    async create(@CurrentUser() user: JwtPayload, @Body() dto: MatchDto) {
        return await this.matchScoreService.create(user.id, dto);
    }
}

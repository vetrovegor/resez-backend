import { Body, Controller, Post } from '@nestjs/common';
import { MatchScoreService } from './match-score.service';
import { CurrentUser } from '@auth/current-user.decorator';
import { JwtPayload } from '@auth/interfaces';
import { MatchDto } from './dto/match.dto';

@Controller('match-score')
export class MatchScoreController {
    constructor(private readonly matchScoreService: MatchScoreService) {}

    @Post()
    async create(@CurrentUser() user: JwtPayload, @Body() dto: MatchDto) {
        return await this.matchScoreService.create(user.id, dto);
    }
}

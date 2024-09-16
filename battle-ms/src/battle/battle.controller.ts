import { Body, Controller, Post } from '@nestjs/common';
import { BattleService } from './battle.service';
import { BattleDto } from './dto/battle.dto';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { JwtPayload } from '@auth/interfaces/interfaces';

@Controller('battle')
export class BattleController {
    constructor(private readonly battleService: BattleService) {}

    @Post()
    async create(@Body() dto: BattleDto, @CurrentUser() user: JwtPayload) {
        return await this.battleService.create(dto, user.id);
    }
}

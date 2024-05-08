import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { LikeService } from './like.service';
import { CurrentUser } from '@auth/current-user.decorator';
import { JwtPayload } from '@auth/interfaces';

@Controller('like')
export class LikeController {
    constructor(private readonly likeService: LikeService) {}

    @Get(':collectionId')
    async toggle(
        @Param('collectionId') collectionId: number,
        @CurrentUser() user: JwtPayload
    ) {
        await this.likeService.toggle(collectionId, user.id);
        return HttpStatus.OK;
    }
}

import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Query
} from '@nestjs/common';
import { TestHistoryService } from './test-history.service';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { JwtPayload } from '@auth/interfaces/interfaces';
import {
    Ctx,
    MessagePattern,
    Payload,
    RmqContext
} from '@nestjs/microservices';

@Controller('test-history')
export class TestHistoryController {
    constructor(private readonly testHistoryService: TestHistoryService) {}

    @Get()
    async find(
        @CurrentUser() user: JwtPayload,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
        @Query('subject_id', new ParseIntPipe({ optional: true }))
        subjectId: number
    ) {
        return await this.testHistoryService.find(
            user.id,
            limit,
            offset,
            subjectId
        );
    }

    @Get(':id')
    async getById(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.testHistoryService.getById(id, user.id);
    }

    @MessagePattern('tests-count')
    async getCountByUserId(
        @Payload() userId: number,
        @Ctx() context: RmqContext
    ) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        const { replyTo } = originalMsg.properties;
        const testsCount =
            await this.testHistoryService.getCountByUserId(userId);
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(testsCount)));
    }
}

import { Controller } from '@nestjs/common';
import {
    Ctx,
    MessagePattern,
    Payload,
    RmqContext
} from '@nestjs/microservices';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
    constructor(private readonly activityService: ActivityService) {}

    @MessagePattern('activity-data')
    async getActivityData(@Payload() userId, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        const { replyTo } = originalMsg.properties;
        const activity = await this.activityService.getActivityData(
            userId.toString()
        );
        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(activity)));
    }
}

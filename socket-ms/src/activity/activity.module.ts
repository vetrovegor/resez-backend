import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';

@Module({
    providers: [ActivityService],
    exports: [ActivityService],
    controllers: [ActivityController]
})
export class ActivityModule {}

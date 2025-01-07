import Activity from '@db/models/Activity';
import { ActivityTypes } from 'src/types/activity';

class ActivityService {
    async createActivity(
        userId: number,
        type: ActivityTypes
    ): Promise<Activity> {
        return await Activity.create({
            userId,
            type
        });
    }
}

export default new ActivityService();

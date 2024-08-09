import { PaginationDTO } from '../dto/PaginationDTO';
import Feedback from '../db/models/Feedback';
import userService from './userService';

class FeedbackService {
    async createFeedback(userId: number, text: string) {
        return await Feedback.create({
            userId: userId != -1 ? userId : null,
            text
        });
    }

    async getFeedback(limit: number, offset: number) {
        const feedbackData = await Feedback.findAll({
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const feedbackDtos = await Promise.all(
            feedbackData.map(async item => {
                const {id, text, userId, createdAt} = item.get();
                
                const user = userId
                    ? await userService.getUserById(userId)
                    : null;

                return {
                    id,
                    text,
                    user: user ? user.toPreview() : null,
                    createdAt
                };
            })
        );

        const totalCount = await Feedback.count();

        return new PaginationDTO(
            'feedback',
            feedbackDtos,
            totalCount,
            limit,
            offset
        );
    }
}

export default new FeedbackService();

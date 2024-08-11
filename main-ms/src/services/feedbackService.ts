import { PaginationDTO } from '../dto/PaginationDTO';
import Feedback from '../db/models/Feedback';
import userService from './userService';
import { ApiError } from '../ApiError';

class FeedbackService {
    async createFeedback(userId: number, text: string) {
        return await Feedback.create({
            userId: userId != -1 ? userId : null,
            text
        });
    }

    async createFeedbackDto(feedback: Feedback) {
        const { id, text, isRead, userId, createdAt } = feedback.get();

        const user = userId ? await userService.getUserById(userId) : null;

        return {
            id,
            text,
            isRead,
            user: user ? user.toPreview() : null,
            createdAt
        };
    }

    async getFeedback(limit: number, offset: number) {
        const feedbackData = await Feedback.findAll({
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const feedbackDtos = await Promise.all(
            feedbackData.map(async item => this.createFeedbackDto(item))
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

    async readFeedback(id: number) {
        const feedback = await Feedback.findByPk(id);

        if (!feedback) {
            throw ApiError.notFound('Жалоба не найдена');
        }

        feedback.set('isRead', true);
        await feedback.save();

        return await this.createFeedbackDto(feedback);
    }
}

export default new FeedbackService();

import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { IsNull, Repository } from 'typeorm';
import { TaskService } from '@task/task.service';
import { CommentRequestDto } from './dto/comment-request.dto';
import { UserService } from '@user/user.service';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        private readonly taskService: TaskService,
        private readonly userService: UserService
    ) {}

    async getById(id: number, userId?: number) {
        const where = {
            id,
            ...(userId != undefined && {
                userId
            })
        };

        const comment = await this.commentRepository.findOne({
            where,
            relations: { parentComment: true, task: true }
        });

        if (!comment) {
            throw new NotFoundException('Комментарий не найден');
        }

        return comment;
    }

    async createDto(comment: Comment) {
        const { id, content, createdAt, updatedAt, userId } = comment;

        const user = await this.userService.getById(userId);

        return {
            id,
            content,
            createdAt,
            updatedAt,
            user
        };
    }

    async create(
        { taskId, parentCommentId, content }: CommentRequestDto,
        userId: number
    ) {
        await this.taskService.getById(taskId);

        if (parentCommentId != undefined) {
            const existingComment = await this.getById(parentCommentId);

            if (existingComment.task.id != taskId) {
                throw new BadRequestException(
                    'Некорректное id родительского комментария'
                );
            }

            if (existingComment.parentComment) {
                throw new BadRequestException(
                    'Нельзя оставлять комментарии к вложенным комментариям'
                );
            }
        }

        const savedComment = await this.commentRepository.save({
            task: {
                id: taskId
            },
            parentComment: {
                id: parentCommentId
            },
            content,
            userId
        });

        return { comment: await this.createDto(savedComment) };
    }

    async find(take: number, skip: number, taskId: number) {
        const where = { task: { id: taskId }, parentComment: IsNull() };

        const commentsData = await this.commentRepository.find({
            where,
            order: { createdAt: 'ASC', replies: { createdAt: 'ASC' } },
            take,
            skip,
            relations: { replies: true }
        });

        const comments = await Promise.all(
            commentsData.map(async comment => {
                const dto = await this.createDto(comment);

                const replies = await Promise.all(
                    comment.replies.map(
                        async reply => await this.createDto(reply)
                    )
                );

                return {
                    ...dto,
                    repliesCount: replies.length,
                    replies
                };
            })
        );

        const totalCount = await this.commentRepository.count({
            where
        });

        return {
            comments,
            totalCount,
            isLast: totalCount <= take + skip,
            elementsCount: comments.length
        };
    }

    async update(id: number, content: string, userId: number) {
        const existingComment = await this.getById(id, userId);

        const updatedComment = await this.commentRepository.save({
            ...existingComment,
            content
        });

        return { comment: await this.createDto(updatedComment) };
    }

    async delete(id: number, userId: number) {
        const existingComment = await this.getById(id, userId);

        return await this.commentRepository.remove(existingComment);
    }
}

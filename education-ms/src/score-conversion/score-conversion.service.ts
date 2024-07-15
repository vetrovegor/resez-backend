import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScoreConversion } from './score-conversion.entity';
import { Repository } from 'typeorm';
import { ScoreConversionItemDto } from './dto/score-conversion.dto';
import { SubjectService } from '@subject/subject.service';
import { SubjectTaskService } from '@subject-task/subject-task.service';

@Injectable()
export class ScoreConversionService {
    constructor(
        @InjectRepository(ScoreConversion)
        private readonly scoreConversionRepository: Repository<ScoreConversion>,
        private readonly subjectService: SubjectService,
        private readonly subjectTaskService: SubjectTaskService
    ) {}

    async save(
        subjectId: number,
        scoreConversionItems: ScoreConversionItemDto[]
    ) {
        const subject = await this.subjectService.getById(subjectId);

        if (subject.isMark) {
            return await this.saveForMarkSystem(
                subjectId,
                scoreConversionItems
            );
        }

        return await this.saveForScoreSystem(subjectId, scoreConversionItems);
    }

    async saveForMarkSystem(
        subjectId: number,
        scoreConversionItems: ScoreConversionItemDto[]
    ): Promise<ScoreConversion[]> {
        const subjectTotalPrimaryScore =
            await this.subjectTaskService.getTotalPrimaryScoreBySubjectId(
                subjectId
            );

        if (scoreConversionItems[0].grade != 2) {
            throw new BadRequestException(
                'Минимальная оценка должна быть равна 2'
            );
        }

        if (scoreConversionItems[scoreConversionItems.length - 1].grade != 5) {
            throw new BadRequestException(
                'Максимальная оценка должна быть равна 5'
            );
        }

        if (
            scoreConversionItems[scoreConversionItems.length - 1].maxScore !=
            subjectTotalPrimaryScore
        ) {
            throw new BadRequestException(
                'Некорректная сумма первичных баллов'
            );
        }

        let expectedMark = 2;
        let expectedScore = 0;

        scoreConversionItems.forEach(item => {
            let { minScore, maxScore, grade } = item;

            if (
                minScore == undefined ||
                maxScore == undefined ||
                grade == undefined
            ) {
                throw new BadRequestException('Ошибка валидации');
            }

            minScore = Number(minScore);
            maxScore = Number(maxScore);
            grade = Number(grade);

            if (grade != expectedMark) {
                throw new BadRequestException(
                    'Оценки идут в неправильном порядке'
                );
            }

            if (minScore > maxScore) {
                throw new BadRequestException(
                    'Нижняя граница не может быть больше верхней'
                );
            }

            if (minScore != expectedScore) {
                throw new BadRequestException(
                    'Баллы идут в неправильном порядке'
                );
            }

            expectedMark++;
            expectedScore = maxScore + 1;
        });

        await this.deleteBySubjectId(subjectId);

        return await Promise.all(
            scoreConversionItems.map(async item => {
                const createdScoreConversion =
                    this.scoreConversionRepository.create({
                        ...item,
                        subject: { id: subjectId }
                    });

                return await this.scoreConversionRepository.save(
                    createdScoreConversion
                );
            })
        );
    }

    async saveForScoreSystem(
        subjectId: number,
        scoreConversionItems: ScoreConversionItemDto[]
    ): Promise<ScoreConversion[]> {
        const subjectTotalPrimaryScore =
            await this.subjectTaskService.getTotalPrimaryScoreBySubjectId(
                subjectId
            );

        if (subjectTotalPrimaryScore != scoreConversionItems.length) {
            throw new BadRequestException(
                'Некорректная сумма первичных баллов'
            );
        }

        let expectedPrimaryScore = 1;
        let previousSecondaryScore = 0;

        scoreConversionItems.forEach(item => {
            let { primaryScore, secondaryScore } = item;

            if (primaryScore == undefined || secondaryScore == undefined) {
                throw new BadRequestException('Ошибка валидации');
            }

            primaryScore = Number(primaryScore);
            secondaryScore = Number(secondaryScore);

            if (primaryScore != expectedPrimaryScore) {
                throw new BadRequestException(
                    'Первичные баллы идут в неправильном порядке'
                );
            }

            if (
                previousSecondaryScore &&
                previousSecondaryScore > secondaryScore
            ) {
                throw new BadRequestException(
                    'Вторичные баллы идут в неправильном порядке'
                );
            }

            expectedPrimaryScore++;
            previousSecondaryScore = secondaryScore;
        });

        if (previousSecondaryScore != 100) {
            throw new BadRequestException(
                'Максимальный вторичный балл должен быть равен 100'
            );
        }

        await this.deleteBySubjectId(subjectId);

        return await Promise.all(
            scoreConversionItems.map(async item => {
                const createdScoreConversion =
                    this.scoreConversionRepository.create({
                        ...item,
                        subject: { id: subjectId }
                    });

                return await this.scoreConversionRepository.save(
                    createdScoreConversion
                );
            })
        );
    }

    async deleteBySubjectId(subjectId: number) {
        return await this.scoreConversionRepository.delete({
            subject: { id: subjectId }
        });
    }

    async getBySubjectId(subjectId: number, checkPublished: boolean = true) {
        const existingSubject = await this.subjectService.getById(subjectId);

        if (checkPublished && !existingSubject.isPublished) {
            throw new NotFoundException('Предмет не найден');
        }

        const scoreConversion = await this.scoreConversionRepository.find({
            where: { subject: { id: subjectId } }
        });

        return { scoreConversion };
    }
}

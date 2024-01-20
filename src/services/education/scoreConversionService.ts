import { ScoreConversionDTO, ScoreConversionItem } from "types/education";
import ScoreConversion from "../../db/models/education/ScoreConversion";
import subjectService from "./subjectService";
import { ApiError } from "../../ApiError";
import subjectTaskService from "./subjectTaskService";

class ScoreConversionService {
    async createScoreConversion(subjectId: number, minScore: number = null, maxScore: number = null, mark: number = null,
        primaryScore: number = null, secondaryScore: number = null, isRed: boolean, isGreen: boolean) {
        return await ScoreConversion.create({
            subjectId,
            minScore,
            maxScore,
            mark,
            primaryScore,
            secondaryScore,
            isRed,
            isGreen
        });
    }

    async saveScoreConversionForMarkSystem(subjectId: number, scoreConversion: ScoreConversionItem[]): Promise<ScoreConversion[]> {
        const subjectTotalPrimaryScore = await subjectTaskService
            .getTotalPrimaryScoreBySubjectId(subjectId);        

        if (scoreConversion[0].mark != 2) {
            throw ApiError.badRequest('Минимальная оценка должна быть равна 2');
        }

        if (scoreConversion[scoreConversion.length - 1].mark != 5) {
            throw ApiError.badRequest('Максимальная оценка должна быть равна 5');
        }

        if (scoreConversion[scoreConversion.length - 1].maxScore != subjectTotalPrimaryScore) {
            throw ApiError.badRequest('Некорректная сумма первичных баллов');
        }

        let expectedMark = 2;
        let expectedScore = 0;

        scoreConversion.forEach(item => {
            let { minScore, maxScore, mark } = item;

            if (minScore == undefined || maxScore == undefined || mark == undefined) {
                throw ApiError.badRequest('Ошибка валидации');
            }

            minScore = Number(minScore);
            maxScore = Number(maxScore);
            mark = Number(mark);

            if (mark != expectedMark) {
                throw ApiError.badRequest('Оценки идут в неправильном порядке');
            }

            if (minScore > maxScore) {
                throw ApiError.badRequest('Нижняя граница не может быть больше верхней');
            }

            if (minScore != expectedScore) {
                throw ApiError.badRequest('Баллы идут в неправильном порядке');
            }

            expectedMark++;
            expectedScore = maxScore + 1;
        });

        await this.deleteScoreConversionBySubjectId(subjectId);

        return await Promise.all(
            scoreConversion.map(async item => {
                const { minScore, maxScore, mark, isRed, isGreen } = item;

                return await this.createScoreConversion(
                    subjectId,
                    minScore,
                    maxScore,
                    mark,
                    null,
                    null,
                    isRed,
                    isGreen
                );
            })
        );
    }

    async saveScoreConversionForScoreSystem(subjectId: number, scoreConversion: ScoreConversionItem[]): Promise<ScoreConversion[]> {
        const subjectTotalPrimaryScore = await subjectTaskService
            .getTotalPrimaryScoreBySubjectId(subjectId);

        if (subjectTotalPrimaryScore != scoreConversion.length) {
            throw ApiError.badRequest('Некорректная сумма первичных баллов');
        }

        let expectedPrimaryScore = 1;
        let previousSecondaryScore = 0;

        scoreConversion.forEach(item => {
            let { primaryScore, secondaryScore } = item;

            if (primaryScore == undefined || secondaryScore == undefined) {
                throw ApiError.validationError();
            }

            primaryScore = Number(primaryScore);
            secondaryScore = Number(secondaryScore);

            if (primaryScore != expectedPrimaryScore) {
                throw ApiError.badRequest('Первичные баллы идут в неправильном порядке');
            }

            if (previousSecondaryScore && previousSecondaryScore > secondaryScore) {
                throw ApiError.badRequest('Вторичные баллы идут в неправильном порядке');
            }

            expectedPrimaryScore++;
            previousSecondaryScore = secondaryScore;
        });

        if (previousSecondaryScore != 100) {
            throw ApiError.badRequest('Максимальный вторичный балл должен быть равен 100');
        }

        await this.deleteScoreConversionBySubjectId(subjectId);

        return await Promise.all(
            scoreConversion.map(
                async item => {
                    const { primaryScore, secondaryScore, isRed, isGreen } = item;

                    return await this.createScoreConversion(
                        subjectId,
                        null,
                        null,
                        null,
                        primaryScore,
                        secondaryScore,
                        isRed,
                        isGreen
                    );
                }
            )
        );
    }

    async saveScoreConversion(subjectId: number, scoreConversion: ScoreConversionItem[]) {
        const existedSubject = await subjectService.getSubjectById(subjectId);

        if (existedSubject.get('isMark')) {
            return await this.saveScoreConversionForMarkSystem(subjectId, scoreConversion);
        }

        return await this.saveScoreConversionForScoreSystem(subjectId, scoreConversion);
    }

    async getScoreConversion(subjectId: number): Promise<ScoreConversionDTO> {
        const subject = await subjectService.getSubjectById(subjectId);

        return subject.getScoreConversion();
    }

    async deleteScoreConversionBySubjectId(subjectId: number): Promise<number> {
        return await ScoreConversion.destroy({
            where: {
                subjectId
            }
        });
    }
}

export default new ScoreConversionService();
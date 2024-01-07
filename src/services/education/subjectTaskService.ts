import { Op } from "sequelize";

import { SubjectTaskBodyDTO } from "types/education";
import SubjectTask from "../../db/models/education/SubjectTask";
import subThemeService from "./subThemeService";
import { ApiError } from "../../apiError";

class SubjectTaskService {
    async createSubjectTask(number: number, theme: string, isDetailedAnswer: boolean, primaryScore: number, subjectId: number): Promise<SubjectTask> {
        return await SubjectTask.create({
            number,
            theme,
            isDetailedAnswer,
            primaryScore,
            subjectId
        });
    }

    async createSubjectTasks(subjectTasks: SubjectTaskBodyDTO[], subjectId: number): Promise<void> {
        let totalPrimaryScore = 0;
        let count = 1;

        for (const subjectTask of subjectTasks) {
            const { theme, isDetailedAnswer, primaryScore, subThemes } = subjectTask;

            const createSubjectTask = await this.createSubjectTask(
                count++,
                theme,
                isDetailedAnswer,
                primaryScore,
                subjectId
            );

            totalPrimaryScore += primaryScore;

            const subjectTaskId = createSubjectTask.id;

            for (const { subTheme } of subThemes) {
                await subThemeService.createSubTheme(subTheme, subjectTaskId);
            }
        }
    }

    async updateSubjectTasks(subjectTasks: SubjectTaskBodyDTO[], subjectId: number): Promise<void> {
        let subjectTaskIDs: number[] = [];
        let count = 1;

        for (const subjectTask of subjectTasks) {
            let { id: subjectTaskId, theme, isDetailedAnswer, primaryScore, subThemes } = subjectTask;

            const existedSubjectTask = await SubjectTask.findByPk(subjectTaskId);

            if (existedSubjectTask && existedSubjectTask.subjectId != subjectId) {
                throw ApiError.badRequest('Некорректное id задания предмета');
            }

            if (existedSubjectTask) {
                existedSubjectTask.set('number', count++);
                existedSubjectTask.set('theme', theme);
                existedSubjectTask.set('isDetailedAnswer', isDetailedAnswer);
                existedSubjectTask.set('primaryScore', primaryScore);
                await existedSubjectTask.save();
            } else {
                const createSubjectTask = await this.createSubjectTask(
                    count++,
                    theme,
                    isDetailedAnswer,
                    primaryScore,
                    subjectId
                );

                subjectTaskId = createSubjectTask.id;
            }

            await subThemeService.updateSubThemes(subThemes, subjectTaskId);

            subjectTaskIDs.push(subjectTaskId);
        }

        await SubjectTask.destroy({
            where: {
                subjectId,
                id: {
                    [Op.notIn]: subjectTaskIDs
                }
            }
        });
    }

    async getTotalPrimaryScoreBySubjectId(subjectId: number): Promise<number> {
        const totalPrimaryScore = await SubjectTask.sum('primaryScore', {
            where: {
                subjectId
            }
        });

        return totalPrimaryScore || 0;
    }
}

export default new SubjectTaskService();
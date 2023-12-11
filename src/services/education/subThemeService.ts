import { Op } from "sequelize";

import { SubThemeBodyDTO } from "types/education";
import SubTheme from "../../db/models/education/SubTheme";
import { ApiError } from "../../apiError";

class SubjectThemeService {
    async createSubTheme(subTheme: string, subjectTaskId: number): Promise<SubTheme> {
        return await SubTheme.create({
            subTheme,
            subjectTaskId
        });
    }

    async updateSubThemes(subThemes: SubThemeBodyDTO[], subjectTaskId: number): Promise<void> {
        let subThemeIDs: number[] = [];

        for (const subThemeItem of subThemes) {
            let { id: subThemeId, subTheme } = subThemeItem;

            const existedSubTheme = await SubTheme.findByPk(subThemeId);

            if (existedSubTheme && existedSubTheme.subjectTaskId != subjectTaskId) {
                throw ApiError.badRequest('Некорректное id подтемы');
            }

            if (existedSubTheme) {
                existedSubTheme.set('subTheme', subTheme);
                await existedSubTheme.save();
            } else {
                const createdSubTheme = await this.createSubTheme(subTheme, subjectTaskId);
                subThemeId = createdSubTheme.id;
            }

            subThemeIDs.push(subThemeId);
        }

        await SubTheme.destroy({
            where: {
                subjectTaskId,
                id: {
                    [Op.notIn]: subThemeIDs
                }
            }
        });
    }
}

export default new SubjectThemeService();
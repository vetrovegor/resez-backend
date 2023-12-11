import ScoreConversion from "../../db/models/education/ScoreConversion";

class ScoreConversionService {
    async deleteScoreConversionBySubjectId(subjectId: number): Promise<number> {
        return await ScoreConversion.destroy({
            where: {
                subjectId
            }
        });
    }
}

export default new ScoreConversionService();
import QA from "../../db/models/memory/QA";
import { qaPair } from "types/collection";

class QAService {
    async createQAFromPairs(QAPairs: qaPair[], collectionId: number): Promise<QA[]> {
        return await Promise.all(
            QAPairs.map(async ({ question, answer }) =>
                await QA.create({
                    question,
                    answer,
                    collectionId
                })
            )
        );
    }

    async deleteQAByCollectionId(collectionId: number): Promise<number> {
        return await QA.destroy({
            where: {
                collectionId
            }
        });
    }
}

export default new QAService();
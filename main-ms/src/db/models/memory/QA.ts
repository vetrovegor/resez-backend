import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";

import Collection from "./Collection";
import { Card } from "types/collection";

@Table({
    timestamps: false,
    tableName: "QA"
})
class QA extends Model {
    @Column({
        type: DataType.STRING
    })
    question: string;

    @Column({
        type: DataType.STRING
    })
    answer: string;

    @ForeignKey(() => Collection)
    @Column
    collectionId: number;

    @BelongsTo(() => Collection)
    collection: Collection;

    toCard(isDefinitionCardFront: boolean = false): Card {
        const { id, question, answer } = this.get();

        return {
            id,
            question: isDefinitionCardFront ? answer : question,
            answer: isDefinitionCardFront ? question : answer
        };
    }
}

export default QA;
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";

import Collection from "./Collection";
import { QADTO } from "types/collection";

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

    toDTO(): QADTO {
        const { id, question, answer } = this.get();
        
        return {
            id,
            question,
            answer
        };
    }
}

export default QA;
import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";

import Test from "./Test";
import Task from "./Task";

@Table({
    timestamps: false,
    tableName: 'tests_tasks'
})
class TestTask extends Model {
    @ForeignKey(() => Test)
    @Column({
        type: DataType.INTEGER
    })
    testId: number;

    @ForeignKey(() => Task)
    @Column({
        type: DataType.INTEGER
    })
    taskId: number;
}

export default TestTask;
import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";

import Test from "./Test";
import Task from "./Task";

@Table({
    tableName: 'tests_tasks',
    timestamps: false
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
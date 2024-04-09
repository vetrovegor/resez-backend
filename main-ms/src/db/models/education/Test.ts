import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';

import Subject from './Subject';
import Task from './Task';
import TestTask from './TestTask';

@Table({
    timestamps: true,
    tableName: 'tests'
})
class Test extends Model {  
    @Column({
        type: DataType.BOOLEAN
    })
    isPrivate: boolean;
    
    @Column({
        type: DataType.BOOLEAN
    })
    isOfficial: boolean;

    @Column({
        type: DataType.BOOLEAN
    })
    isExam: boolean;

    @ForeignKey(() => Subject)
    @Column
    subjectId: number;

    @BelongsTo(() => Subject)
    subject: Subject;

    @BelongsToMany(() => Task, () => TestTask)
    users: Task[];
}

export default Test;

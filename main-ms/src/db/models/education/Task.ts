import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';

import SubjectTask from './SubjectTask';
import SubTheme from './SubTheme';
import Subject from './Subject';
import Test from './Test';
import TestTask from './TestTask';

@Table({
    timestamps: true,
    tableName: 'tasks'
})
class Task extends Model {  
    @Column({
        type: DataType.STRING
    })
    task: string;

    @Column({
        type: DataType.TEXT
    })
    solution: string;

    @Column({
        type: DataType.STRING
    })
    answer: string;

    @Column({
        type: DataType.BOOLEAN
    })
    isVerified: boolean;

    @ForeignKey(() => Subject)
    @Column
    subjectId: number;

    @BelongsTo(() => Subject)
    subject: Subject;

    @ForeignKey(() => SubTheme)
    @Column
    subThemeId: number;

    @BelongsTo(() => SubTheme)
    subTheme: SubTheme;

    @ForeignKey(() => SubjectTask)
    @Column
    subjectTaskId: number;

    @BelongsTo(() => SubjectTask)
    subjectTask: SubjectTask;

    @BelongsToMany(() => Test, () => TestTask)
    users: Test[];
}

export default Task;

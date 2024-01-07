import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';

import SubjectTask from './SubjectTask';
import Task from './Task';
import { SubThemeDTO } from 'types/education';

@Table({
    timestamps: false,
    tableName: 'sub-themes'
})
class SubTheme extends Model {    
    @Column({
        type: DataType.STRING
    })
    subTheme: string;

    @ForeignKey(() => SubjectTask)
    @Column
    subjectTaskId: number;

    @BelongsTo(() => SubjectTask)
    subjectTask: SubjectTask;

    @HasMany(() => Task, {
        onDelete: 'CASCADE'
    })
    tasks: Task[];

    async toDTO(): Promise<SubThemeDTO> {
        const { id, subTheme } = this.get();

        const tasksCount = await Task.count({
            where: {
                subThemeId: id
            }
        });

        return {
            id,
            subTheme,
            tasksCount
        };
    }
}

export default SubTheme;

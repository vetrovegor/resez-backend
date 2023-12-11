import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';

import Subject from './Subject';
import SubTheme from './SubTheme';
import Task from './Task';
import { SubjectTaskDTO } from 'types/education';

@Table({
    tableName: 'subjects_task',
    timestamps: false
})
class SubjectTask extends Model {    
    @Column({
        type: DataType.INTEGER
    })
    number: number;
    
    @Column({
        type: DataType.STRING
    })
    theme: string;
    
    @Column({
        type: DataType.INTEGER
    })
    primaryScore: number;
    
    @Column({
        type: DataType.BOOLEAN
    })
    isDetailedAnswer: boolean;

    @ForeignKey(() => Subject)
    @Column
    subjectId: number;

    @BelongsTo(() => Subject)
    subject: Subject;

    @HasMany(() => SubTheme, {
        onDelete: 'CASCADE'
    })
    subThemes: SubTheme[];

    @HasMany(() => Task, {
        onDelete: 'CASCADE'
    })
    tasks: Task[];

    async toDTO(): Promise<SubjectTaskDTO> {
        const { id, number, theme, primaryScore, isDetailedAnswer } = this.get();

        const subThemesData = await SubTheme.findAll({
            where: {
                subjectTaskId: id
            }
        });

        const subThemes = await Promise.all(
            subThemesData.map(
                async subTheme => await subTheme.toDTO()
            )
        );

        let totalTasksCount = 0;

        subThemes.forEach(subTheme => totalTasksCount += subTheme.tasksCount);

        return {
            id,
            number,
            theme,
            primaryScore,
            isDetailedAnswer,
            totalTasksCount,
            subThemes
        };
    }
}

export default SubjectTask;

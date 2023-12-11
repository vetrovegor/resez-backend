import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';

import SubjectTask from './SubjectTask';
import Task from './Task';
import ScoreConversion from './ScoreConversion';
import { SubjectFullInfo, SubjectShortInfo } from 'types/education';

@Table({
    tableName: 'subjects'
})
class Subject extends Model {
    @Column({
        type: DataType.STRING
    })
    subject: string;

    @Column({
        type: DataType.INTEGER
    })
    durationMinutes: number;

    @Column({
        type: DataType.BOOLEAN
    })
    isMark: boolean;

    @Column({
        type: DataType.BOOLEAN
    })
    isPublished: boolean;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isArchive: boolean;

    @HasMany(() => SubjectTask, {
        onDelete: 'CASCADE'
    })
    subjectTasks: SubjectTask[];

    @HasMany(() => Task, {
        onDelete: 'CASCADE'
    })
    tasks: Task[];

    @HasMany(() => ScoreConversion, {
        onDelete: 'CASCADE'
    })
    scoreConversions: ScoreConversion[];

    async toShortInfo(): Promise<SubjectShortInfo> {
        const { id, subject, isPublished } = this.get();        

        // попробовать сразу обратиться к this.subjectTasks.count()
        const subjectTasksCount = await SubjectTask.count({
            where: {
                subjectId: id
            }
        });

        const tasksCount = await Task.count({
            where: {
                subjectId: id
            }
        });

        return {
            id,
            subject,
            isPublished,
            subjectTasksCount,
            tasksCount
        };
    }

    async toFullInfo(): Promise<SubjectFullInfo> {
        const { id, subject, durationMinutes, isMark, isPublished } = this.get();

        const subjectTasksData = await SubjectTask.findAll({
            where: {
                subjectId: id
            }
        });

        const subjectTasks = await Promise.all(
            subjectTasksData.map(
                async subjectTask => await subjectTask.toDTO()
            )
        );

        return {
            id,
            subject,
            durationMinutes,
            isMark,
            isPublished,
            subjectTasks
        }
    }
}

export default Subject;

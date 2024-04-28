import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';

import SubjectTask from './SubjectTask';
import Task from './Task';
import ScoreConversion from './ScoreConversion';
import { ScoreConversionDTO, SubjectFullInfo, SubjectShortInfo } from 'types/education';

@Table({
    timestamps: true,
    tableName: 'subjects'
})
class Subject extends Model {
    @Column({
        type: DataType.STRING
    })
    subject: string;

    
    @Column({
        type: DataType.STRING
    })
    slug: string;

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
    isArchived: boolean;

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
        const { id, subject, slug, isPublished } = this.get();

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
            slug,
            isPublished,
            subjectTasksCount,
            tasksCount
        };
    }

    async toFullInfo(): Promise<SubjectFullInfo> {
        const { id, subject, slug, durationMinutes, isMark, isPublished } = this.get();

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
            slug,
            durationMinutes,
            isMark,
            isPublished,
            subjectTasks
        }
    }

    async getScoreConversion(): Promise<ScoreConversionDTO> {
        const { id: subjectId, isMark } = this.get();

        const scoreConversionData = await ScoreConversion.findAll({
            where: {
                subjectId
            }
        });

        const scoreConversion = scoreConversionData.map(
            scoreConversionItem => scoreConversionItem.toDTO()
        );

        return {
            isMark,
            scoreConversion
        };
    }
}

export default Subject;

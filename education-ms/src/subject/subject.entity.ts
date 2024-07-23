import { ScoreConversion } from '@score-conversion/score-conversion.entity';
import { SubjectTask } from '@subject-task/subject-task.entity';
import { Task } from '@task/task.entity';
import { Test } from '@test/test.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity({
    name: 'subjects'
})
export class Subject {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    subject: string;

    @Column()
    slug: string;

    @Column()
    durationMinutes: number;

    @Column()
    isMark: boolean;

    @Column()
    isPublished: boolean;

    @Column({ default: false })
    isArchived: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => SubjectTask, subjectTask => subjectTask.subject, {
        cascade: true
    })
    subjectTasks: SubjectTask[];

    @OneToMany(
        () => ScoreConversion,
        scoreConversion => scoreConversion.subject,
        {
            cascade: true
        }
    )
    scoreConversions: ScoreConversion[];

    @OneToMany(() => Task, task => task.subject, {
        cascade: true
    })
    tasks: Task[];

    @OneToMany(() => Test, test => test.subject, {
        cascade: true
    })
    tests: Test[];
}

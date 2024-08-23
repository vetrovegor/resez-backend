import { TaskAttempt } from '@task-attempt/task-attempt.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';

@Entity({
    name: 'tests_history'
})
export class TestHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'test_id' })
    testId: number;

    @Column({ name: 'subject_id' })
    subjectId: number;

    @Column()
    subject: string;

    @Column({ name: 'duration_minutes' })
    durationMinutes: number;

    @Column({ name: 'max_primary_score' })
    maxPrimaryScore: number;

    @Column({ name: 'seconds_spent' })
    secondsSpent: number;

    @Column({ name: 'primary_score' })
    primaryScore: number;

    @Column({ name: 'secondary_score', nullable: true })
    secondaryScore: number;

    @Column({ nullable: true })
    grade: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => TaskAttempt, taskAttempt => taskAttempt.testHistory, {
        cascade: true
    })
    taskAttempts: TaskAttempt[];
}

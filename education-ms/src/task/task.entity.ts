import { SubTheme } from '@sub-theme/sub-theme.entity';
import { SubjectTask } from '@subject-task/subject-task.entity';
import { Subject } from '@subject/subject.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity({
    name: 'tasks'
})
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    task: string;

    @Column({ type: 'text', nullable: true })
    solution: string;

    @Column({ nullable: true })
    answer: string;

    @Column({ name: 'is_verified' })
    isVerified: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Subject, subject => subject.tasks, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'subject_id'
    })
    subject: Subject;

    @ManyToOne(() => SubjectTask, subjectTask => subjectTask.tasks, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'subject_task_id'
    })
    subjectTask: Subject;

    @ManyToOne(() => SubTheme, subTheme => subTheme.tasks, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'subject_theme_id'
    })
    subTheme: SubTheme;
}

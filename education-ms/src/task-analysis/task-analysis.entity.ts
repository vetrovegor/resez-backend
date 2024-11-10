import { SubjectTask } from '@subject-task/subject-task.entity';
import { Subject } from '@subject/subject.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity({
    name: 'tasks_analysis'
})
export class TaskAnalysis {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    content: string;

    @Column({ name: 'is_published', default: false })
    isPublished: boolean;

    @Column({ name: 'user_id' })
    userId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToOne(() => SubjectTask, subjectTask => subjectTask.tasksAnalysis)
    @JoinColumn({ name: 'subject_task_id' })
    subjectTask: SubjectTask;

    @ManyToOne(() => Subject, subject => subject.tasksAnalysis, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'subject_id'
    })
    subject: Subject;
}

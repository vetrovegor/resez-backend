import { SubTheme } from '@sub-theme/sub-theme.entity';
import { SubjectTask } from '@subject-task/subject-task.entity';
import { Subject } from '@subject/subject.entity';
import { Test } from '@test/test.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ValueTransformer
} from 'typeorm';
import { Comment } from '@comment/comment.entity';

class SemiColonArrayTransformer implements ValueTransformer {
    // Сериализация: из массива в строку
    to(value: string[]): string {
        return value.join(';');
    }

    // Десериализация: из строки в массив
    from(value: string[]): string[] {
        return value ? value.join().split(';') : [];
    }
}

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

    @Column('simple-array', {
        nullable: true,
        transformer: new SemiColonArrayTransformer()
    })
    answers: string[];

    @Column({ name: 'is_verified' })
    isVerified: boolean;

    @Column({ name: 'is_archived', default: false })
    isArchived: boolean;

    @Column({ nullable: true })
    source: string;

    @Column({ name: 'user_id' })
    userId: number;

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
    subjectTask: SubjectTask;

    @ManyToOne(() => SubTheme, subTheme => subTheme.tasks)
    @JoinColumn({
        name: 'subject_theme_id'
    })
    subTheme: SubTheme;

    @ManyToMany(() => Test, test => test.tasks)
    tests: Test[];

    @OneToMany(() => Comment, comment => comment.task, { cascade: true })
    comments: Comment[];
}

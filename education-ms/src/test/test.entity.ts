import { Subject } from '@subject/subject.entity';
import { Task } from '@task/task.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity({
    name: 'tests'
})
export class Test {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'is_private' })
    isPrivate: boolean;

    @Column({ name: 'is_official', default: false })
    isOfficial: boolean;

    @Column({ name: 'is_exam' })
    isExam: boolean;

    @Column({ name: 'user_id' })
    userId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Subject, subject => subject.tests, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'subject_id'
    })
    subject: Subject;

    @ManyToMany(() => Task, task => task.tests)
    @JoinTable()
    tasks: Task[];
}

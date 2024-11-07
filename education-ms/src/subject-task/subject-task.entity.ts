import { SubTheme } from '@sub-theme/sub-theme.entity';
import { Subject } from '@subject/subject.entity';
import { TaskAnalysis } from '@task-analysis/task-analysis.entity';
import { Task } from '@task/task.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';

@Entity({
    name: 'subject_tasks'
})
export class SubjectTask {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    number: number;

    @Column()
    theme: string;

    @Column({ name: 'primary_score' })
    primaryScore: number;

    @Column({ name: 'is_detailed_answer' })
    isDetailedAnswer: boolean;

    @ManyToOne(() => Subject, subject => subject.subjectTasks, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'subject_id'
    })
    subject: Subject;

    @OneToMany(() => SubTheme, subTheme => subTheme.subjectTask, {
        cascade: true
    })
    subThemes: SubTheme[];

    @OneToMany(() => Task, task => task.subjectTask, {
        cascade: true
    })
    tasks: Task[];

    @OneToMany(() => TaskAnalysis, taskAnalysis => taskAnalysis.subjectTask, {
        cascade: true
    })
    tasksAnalysis: TaskAnalysis[];
}

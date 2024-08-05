import { SubjectTask } from '@subject-task/subject-task.entity';
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
    name: 'sub_themes'
})
export class SubTheme {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    subTheme: string;

    @ManyToOne(() => SubjectTask, subjectTask => subjectTask.subThemes, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'subject_task_id'
    })
    subjectTask: SubjectTask;

    @OneToMany(() => Task, task => task.subTheme)
    tasks: Task[];
}

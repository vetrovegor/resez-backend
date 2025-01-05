import { Task } from '@task/task.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    name: 'sources'
})
export class Source {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    source: string;

    @Column()
    slug: string;

    @OneToMany(() => Task, task => task.sourceRelation)
    tasks: Task[];
}

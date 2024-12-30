import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Task } from '@task/task.entity';

@Entity({
    name: 'comments'
})
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    content: string;

    @Column({ name: 'user_id' })
    userId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Task, task => task.comments, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'task_id'
    })
    task: Task;

    @ManyToOne(() => Comment, comment => comment.replies, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'parent_comment_id'
    })
    parentComment: Comment;

    @OneToMany(() => Comment, comment => comment.parentComment, {
        cascade: true
    })
    replies: Comment[];
}

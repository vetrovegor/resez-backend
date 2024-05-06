import { Qa } from '@qa/qa.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity({
    name: 'collections'
})
export class Collection {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    collection: string;

    @Column({ nullable: true })
    description: string;

    @Column({ name: 'is_private' })
    isPrivate: boolean;

    @Column({ name: 'user_id' })
    userId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Qa, qa => qa.collection, {
        cascade: true
    })
    questionsAnswers: Qa[];
}

import { Collection } from '@collection/collection.entity';
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
    name: 'matches_scores'
})
export class MatchScore {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ type: 'float' })
    time: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Collection, collection => collection.matchScores, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'collection_id'
    })
    collection: Collection;
}

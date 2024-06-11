import { Collection } from '@collection/collection.entity';
import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn
} from 'typeorm';

@Entity({
    name: 'likes'
})
export class Like {
    @PrimaryColumn({ name: 'collection_id' })
    collectionId: number;

    @PrimaryColumn({ name: 'user_id' })
    userId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Collection, collection => collection.questionsAnswers, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'collection_id'
    })
    collection: Collection;
}

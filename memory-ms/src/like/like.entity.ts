import { Entity, PrimaryColumn } from 'typeorm';

@Entity({
    name: 'likes'
})
export class Like {
    @PrimaryColumn({ name: 'collection_id' })
    collectionId: number;

    @PrimaryColumn({ name: 'user_id' })
    userId: number;
}

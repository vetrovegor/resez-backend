import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    name: 'battles'
})
export class Battle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'players_count' })
    playersCount: number;

    @Column({ name: 'is_private' })
    isPrivate: boolean;

    @Column({ name: 'creator_id' })
    creatorId: number;
}

import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { BattleTypes } from './enums';

@Entity({
    name: 'battles'
})
export class Battle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: BattleTypes
    })
    type: BattleTypes;

    @Column({ name: 'players_count' })
    playersCount: number;

    @Column({ name: 'is_private' })
    isPrivate: boolean;

    @Column({ name: 'creator_id' })
    creatorId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

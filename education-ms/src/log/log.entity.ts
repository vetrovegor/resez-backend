import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn
} from 'typeorm';

export enum LogType {
    CREATE_SUBJECT = 'Создание предмета',
    UPDATE_SUBJECT = 'Редактирование предмета',
    ARCHIVE_SUBJECT = 'Архивация предмета',
    UPDATE_SCORE_CONVERSION = 'Редактирование таблицы баллов',
    CREATE_TASK = 'Создание задания',
    UPDATE_TASK = 'Редактирование задания',
    ARCHIVE_TASK = 'Архивация задания'
}

@Entity({
    name: 'logs'
})
export class Log {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'log_type',
        type: 'enum',
        enum: LogType
    })
    type: LogType;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'entity_id' })
    entityId: number;

    @Column({ name: 'current_entity', type: 'simple-json' })
    currentEntity: string;

    @Column({ name: 'old_entity', type: 'simple-json', nullable: true })
    oldEntity: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

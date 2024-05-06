import { Collection } from '@collection/collection.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';

@Entity({
    name: 'questions_answers'
})
export class Qa {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'question_text', nullable: true })
    questionText: string;

    @Column({ name: 'question_picture', nullable: true })
    questionPicture: string;

    @Column({ name: 'answer_text', nullable: true })
    answerText: string;

    @Column({ name: 'answer_picture', nullable: true })
    answerPicture: string;

    @ManyToOne(() => Collection, (collection) => collection.questionsAnswers, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'collection_id'
    })
    collection: Collection;
}

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
    name: 'settings'
})
export class Settings {
    @PrimaryColumn({ name: 'user_id' })
    userId: number;

    @Column({ name: 'shuffle_cards', default: false })
    shuffleCards: boolean = false;

    @Column({ name: 'answer_on_front', default: false })
    answerOnFront: boolean = false;

    @Column({ name: 'shuffle_memorization', default: false })
    shuffleMemorization: boolean = false;

    @Column({ name: 'show_answer_immediately', default: false })
    showAnswerImmediately: boolean = false;

    @Column({ name: 'true_false_mode', default: false })
    trueFalseMode: boolean = false;

    @Column({ name: 'write_mode', default: false })
    writeMode: boolean = false;
}

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
    name: 'settings'
})
export class Settings {
    @PrimaryColumn({ name: 'user_id' })
    userId: number;

    // карточки
    @Column({ name: 'shuffle_cards', default: false })
    shuffleCards: boolean;

    @Column({ name: 'cards_answer_on_front', default: false })
    cardsAnswerOnFront: boolean;

    // заучивание
    @Column({ name: 'shuffle_memorization', default: false })
    shuffleMemorization: boolean;

    @Column({ name: 'show_answer_immediately', default: false })
    showAnswerImmediately: boolean;

    // тест
    @Column({ name: 'max_questions', default: 20 })
    maxQuestions: number;

    @Column({ name: 'shuffle_test', default: false })
    shuffleTest: boolean;

    @Column({ name: 'test_answer_on_front', default: true })
    testAnswerOnFront: boolean;

    @Column({ name: 'answer_choice_mode', default: true })
    answerChoiceMode: boolean;

    @Column({ name: 'true_false_mode', default: false })
    trueFalseMode: boolean;

    @Column({ name: 'write_mode', default: false })
    writeMode: boolean;
}

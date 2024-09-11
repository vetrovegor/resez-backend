import { TestHistory } from '@test-history/test-history.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    ValueTransformer
} from 'typeorm';

class SemiColonArrayTransformer implements ValueTransformer {
    // Сериализация: из массива в строку
    to(value: string[]): string {
        return value.join(';');
    }

    // Десериализация: из строки в массив
    from(value: string[]): string[] {
        return value ? value.join().split(';') : [];
    }
}

@Entity({
    name: 'task_attempts'
})
export class TaskAttempt {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'task_id' })
    taskId: number;

    @Column({ name: 'theme_id' })
    themeId: number;

    @Column()
    theme: string;

    @Column({ name: 'sub_theme_id' })
    subThemeId: number;

    @Column({ name: 'sub_theme' })
    subTheme: string;

    @Column({ type: 'text' })
    task: string;

    @Column({ type: 'text', nullable: true })
    solution: string;

    @Column('simple-array', {
        nullable: true,
        transformer: new SemiColonArrayTransformer(),
        name: 'correct_answers'
    })
    correctAnswers: string[];

    @Column({ name: 'max_primary_score' })
    maxPrimaryScore: number;

    @Column({ nullable: true })
    source: string;

    @Column({ name: 'user_answer', nullable: true })
    userAnswer: string;

    @Column({ name: 'is_correct', nullable: true })
    isCorrect: boolean;

    @Column()
    number: number;

    @Column({ name: 'primary_score' })
    primaryScore: number;

    @Column({ name: 'is_detailed_answer' })
    isDetailedAnswer: boolean;

    @ManyToOne(() => TestHistory, testHistory => testHistory.taskAttempts, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'test_history_id'
    })
    testHistory: TestHistory;
}

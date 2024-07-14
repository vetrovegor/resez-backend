import { Subject } from '@subject/subject.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';

@Entity({
    name: 'score_conversions'
})
export class ScoreConversion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'primary_score' })
    primaryScore: number;

    @Column({ name: 'secondary_score' })
    secondaryScore: number;

    @Column({ name: 'min_score' })
    minScore: number;

    @Column({ name: 'max_score' })
    maxScore: number;

    @Column({ name: 'mark' })
    mark: number;

    @Column({ name: 'is_red' })
    isRed: number;

    @Column({ name: 'is_green' })
    isGreen: number;

    @ManyToOne(() => Subject, subject => subject.subjectTasks, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'subject_id'
    })
    subject: Subject;
}

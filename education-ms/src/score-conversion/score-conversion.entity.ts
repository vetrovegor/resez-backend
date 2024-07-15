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

    @Column({ name: 'primary_score', nullable: true })
    primaryScore: number;

    @Column({ name: 'secondary_score', nullable: true })
    secondaryScore: number;

    @Column({ name: 'min_score', nullable: true })
    minScore: number;

    @Column({ name: 'max_score', nullable: true })
    maxScore: number;

    @Column({ name: 'grade', nullable: true })
    grade: number;

    @Column({ name: 'is_red' })
    isRed: boolean;

    @Column({ name: 'is_green' })
    isGreen: boolean;

    @ManyToOne(() => Subject, subject => subject.subjectTasks, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'subject_id'
    })
    subject: Subject;
}

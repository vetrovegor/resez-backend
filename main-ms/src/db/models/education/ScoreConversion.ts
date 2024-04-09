import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

import Subject from './Subject';
import { ScoreConversionItem } from 'types/education';

@Table({
    timestamps: false,
    tableName: 'score_conversions'
})
class ScoreConversion extends Model {  
    @Column({
        type: DataType.INTEGER
    })
    primaryScore: number;
    
    @Column({
        type: DataType.INTEGER
    })
    secondaryScore: number;
    
    @Column({
        type: DataType.INTEGER
    })
    minScore: number;
    
    @Column({
        type: DataType.INTEGER
    })
    maxScore: number;
    
    @Column({
        type: DataType.INTEGER
    })
    mark: number;
    
    @Column({
        type: DataType.BOOLEAN
    })
    isRed: boolean;
    
    @Column({
        type: DataType.BOOLEAN
    })
    isGreen: boolean;

    @ForeignKey(() => Subject)
    @Column
    subjectId: number;

    @BelongsTo(() => Subject)
    subject: Subject;

    toDTO(): ScoreConversionItem {
        const {id, minScore, maxScore, mark, primaryScore, secondaryScore, isRed, isGreen} = this.get();

        return {
            id,
            minScore,
            maxScore,
            mark,
            primaryScore,
            secondaryScore,
            isRed,
            isGreen
        }
    }
}

export default ScoreConversion;

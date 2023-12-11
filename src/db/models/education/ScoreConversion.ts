import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

import Subject from './Subject';

@Table({
    tableName: 'score_conversions',
    timestamps: false
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
}

export default ScoreConversion;

import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo
} from 'sequelize-typescript';
import User from './User';

@Table({
    timestamps: true,
    tableName: 'activity'
})
class Activity extends Model {
    @Column({
        type: DataType.STRING
    })
    type: string;

    @ForeignKey(() => User)
    @Column
    userId: number;

    @BelongsTo(() => User)
    user: User;
}

export default Activity;

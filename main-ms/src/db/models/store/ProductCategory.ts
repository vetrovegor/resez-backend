import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import Category from "./Category";
import AvatarDecoration from "./avatarDecoration/AvatarDecoration";
import Theme from "./theme/Theme";

@Table({
    timestamps: true,
    tableName: 'products_categories'
})
class ProductCategory extends Model {
    @ForeignKey(() => Category)
    @Column({
        type: DataType.INTEGER
    })
    categoryId: number;

    @BelongsTo(() => Category)
    category: Category;

    @ForeignKey(() => AvatarDecoration)
    @Column({
        type: DataType.INTEGER
    })
    avatarDecorationId: number;

    @BelongsTo(() => AvatarDecoration)
    avatarDecoration: AvatarDecoration;

    @ForeignKey(() => Theme)
    @Column({
        type: DataType.INTEGER
    })
    themeId: number;

    @BelongsTo(() => Theme)
    theme: Theme;
}

export default ProductCategory;
import { BelongsToMany, Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import AvatarDecoration from "./avatarDecoration/AvatarDecoration";
import ProductCategory from "./ProductCategory";
import Theme from "./theme/Theme";

@Table({
    timestamps: true,
    tableName: 'categories'
})
class Category extends Model {
    @Column({
        type: DataType.STRING
    })
    category: string;

    @Column({
        type: DataType.STRING
    })
    slug: string;

    @BelongsToMany(() => AvatarDecoration, () => ProductCategory)
    avatarDecorations: AvatarDecoration[];

    @BelongsToMany(() => Theme, () => ProductCategory)
    themes: Theme[];

    @HasMany(() => ProductCategory)
    productCategories: ProductCategory[];
}

export default Category;
import { Op } from 'sequelize';

import { ApiError } from '@ApiError';
import Category from '@db/models/store/Category';
import { CategoryDTO } from 'src/types/store';
import ProductCategory from '@db/models/store/ProductCategory';
import { PaginationDTO } from '../../dto/PaginationDTO';
import themeService from './themeService';
import avatarDecorationService from './avatarDecorationService';
import { shuffleArray } from '@utils';

class CategoryService {
    async getCategoryById(id: number) {
        const category = await Category.findByPk(id, {
            include: ['productCategories']
        });

        if (!category) {
            throw ApiError.notFound('Категория не найдена');
        }

        return category;
    }

    createCategoryDto(categoryData: Category) {
        const { id, category, slug } = categoryData;

        return {
            id,
            category,
            slug
        };
    }

    async createCategory({ category, slug }: CategoryDTO) {
        const existingCategory = await Category.findOne({
            where: {
                slug
            }
        });

        if (existingCategory) {
            throw ApiError.badRequest(
                'Категория с таким ярылком уже существует'
            );
        }

        const createdCategory = await Category.create({
            category,
            slug
        });

        return this.createCategoryDto(createdCategory);
    }

    async getCategoriesForAdmin(limit: number, offset: number) {
        const { rows: categoriesData, count: totalCount } =
            await Category.findAndCountAll({
                include: ['productCategories'],
                order: [['createdAt', 'DESC']],
                distinct: true,
                limit,
                offset
            });

        const categories = categoriesData.map(categoryData => ({
            ...this.createCategoryDto(categoryData),
            productsCount: categoryData.get('productCategories').length
        }));

        return new PaginationDTO(
            'categories',
            categories,
            totalCount,
            limit,
            offset
        );
    }

    async getCategoryInfo(id: number) {
        const existingCategory = await this.getCategoryById(id);

        return this.createCategoryDto(existingCategory);
    }

    async updateCategory(id: number, { category, slug }: CategoryDTO) {
        const existingCategory = await this.getCategoryById(id);

        const occupiedCategory = await Category.findOne({
            where: {
                slug,
                id: {
                    [Op.ne]: id
                }
            }
        });

        if (occupiedCategory) {
            throw ApiError.badRequest(
                'Категория с таким ярылком уже существует'
            );
        }

        existingCategory.set('category', category);
        existingCategory.set('slug', slug);

        await existingCategory.save();

        return this.createCategoryDto(existingCategory);
    }

    async deleteCategory(id: number) {
        const existingCategory = await this.getCategoryById(id);

        if (existingCategory.get('productCategories').length > 0) {
            throw ApiError.badRequest(
                'Нельзя удалить категорию, так как есть товары с ней'
            );
        }

        await existingCategory.destroy();

        return this.createCategoryDto(existingCategory);
    }

    async validateCategoryIds(categoryIds: number[]) {
        const count = await Category.count({
            where: {
                id: { [Op.in]: categoryIds }
            }
        });

        return count == categoryIds.length;
    }

    async createThemeCategories(categoryIds: number[], themeId: number) {
        const productCategories = categoryIds.map(categoryId => ({
            categoryId,
            themeId
        }));

        await ProductCategory.bulkCreate(productCategories);
    }

    async createAvatarDecorationCategories(
        categoryIds: number[],
        avatarDecorationId: number
    ) {
        const productCategories = categoryIds.map(categoryId => ({
            categoryId,
            avatarDecorationId
        }));

        await ProductCategory.bulkCreate(productCategories);
    }

    async getCategoriesForUser(limit: number, offset: number) {
        const { rows: categoriesData, count: totalCount } =
            await Category.findAndCountAll({
                include: [
                    { association: 'productCategories', required: true },
                    {
                        association: 'avatarDecorations',
                        include: [
                            'requiredSubscription',
                            'requiredAchievement',
                            'userAvatarDecorations',
                            'categories'
                        ]
                    },
                    {
                        association: 'themes',
                        include: [
                            'requiredSubscription',
                            'requiredAchievement',
                            'userThemes',
                            'categories'
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']],
                distinct: true,
                limit,
                offset
            });

        const categories = categoriesData.map(categoryData => {
            const avatarDecorations = categoryData
                .get('avatarDecorations')
                .map(avatarDecoration =>
                    avatarDecorationService.createAvatarDecorationDto({
                        avatarDecoration
                    })
                );

            const themes = categoryData.get('themes').map(theme =>
                themeService.createThemeDto({
                    theme
                })
            );

            const products = [...themes, ...avatarDecorations];

            shuffleArray(products);

            products.splice(3);

            return {
                ...this.createCategoryDto(categoryData),
                productsCount: categoryData.get('productCategories').length,
                products
            };
        });

        return new PaginationDTO(
            'categories',
            categories,
            totalCount,
            limit,
            offset
        );
    }

    async getCategoriesProductsBySlug(slug: string) {
        const categoryData = await Category.findOne({
            where: { slug },
            include: [
                { association: 'productCategories', required: true },
                {
                    association: 'avatarDecorations',
                    include: [
                        'requiredSubscription',
                        'requiredAchievement',
                        'userAvatarDecorations',
                        'categories'
                    ]
                },
                {
                    association: 'themes',
                    include: [
                        'requiredSubscription',
                        'requiredAchievement',
                        'userThemes',
                        'categories'
                    ]
                }
            ]
        });

        if (!categoryData) {
            throw ApiError.notFound('Категория не найдена');
        }

        const avatarDecorations = categoryData
            .get('avatarDecorations')
            .map(avatarDecoration =>
                avatarDecorationService.createAvatarDecorationDto({
                    avatarDecoration
                })
            );

        const themes = categoryData.get('themes').map(theme =>
            themeService.createThemeDto({
                theme
            })
        );

        return {
            ...this.createCategoryDto(categoryData),
            productsCount: categoryData.get('productCategories').length,
            avatarDecorations,
            themes
        };
    }
}

export default new CategoryService();

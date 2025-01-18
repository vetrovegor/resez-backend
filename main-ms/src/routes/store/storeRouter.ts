import { Router } from 'express';

import { avatarDecorationRouter } from './avatarDecorationRouter';
import { themeRouter } from './themeRouter';
import { categoryRouter } from './categoryRouter';

export const storeRouter = Router();

storeRouter.use('/avatar-decoration', avatarDecorationRouter);

storeRouter.use('/theme', themeRouter);

storeRouter.use('/category', categoryRouter);

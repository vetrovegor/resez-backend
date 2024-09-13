import { Router } from 'express';

import { avatarDecorationRouter } from './avatarDecorationRouter';
import { themeRouter } from './themeRouter';

export const storeRouter = Router();

storeRouter.use('/avatar-decoration', avatarDecorationRouter);

storeRouter.use('/theme', themeRouter);

import { Router } from 'express';

import { avatarDecorationRouter } from './avatarDecorationRouter';

export const storeRouter = Router();

storeRouter.use('/avatar-decoration', avatarDecorationRouter);

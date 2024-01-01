import { Router } from "express";
import { body, param } from "express-validator";

import { subjectTasksMiddleware } from "../../../middlewares/subjectTasksMiddleware";
import { accessTokenMiddleware } from "../../../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../../../middlewares/blockedMiddleware";
import subjectController from "../../../controllers/education/subjectController";
import { validationMiddleware } from "../../../middlewares/validationMiddleware";

export const subjectsRouter = Router();

subjectsRouter.post(
    '/',
    // вынести
    body('subject').isString().notEmpty().isLength({ max: 75 }),
    body('subjectTasks').isArray({ min: 1 }),
    body('subjectTasks.*.theme').isString().notEmpty().isLength({ max: 150 }),
    body('subjectTasks.*.primaryScore').isNumeric(),
    body('subjectTasks.*.isDetailedAnswer').isBoolean(),
    body('subjectTasks.*.subThemes').isArray({ min: 1 }),
    body('subjectTasks.*.subThemes.*').isObject(),
    body('subjectTasks.*.subThemes.*.subTheme').isString().notEmpty().isLength({ max: 150 }),
    body('durationMinutes').isNumeric(),
    body('isMark').isBoolean(),
    body('isPublished').isBoolean(),
    validationMiddleware,
    subjectTasksMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    // permissionMiddleware(PERMISSIONS.CREATE_SUBJECTS),
    subjectController.createSubject
);

subjectsRouter.patch(
    '/:id',
    // вынести
    param('id').isNumeric(),
    body('subject').isString().notEmpty().isLength({ max: 75 }),
    body('subjectTasks').isArray({ min: 1 }),
    body('subjectTasks.*.id').isNumeric().optional(),
    body('subjectTasks.*.theme').isString().notEmpty().isLength({ max: 75 }),
    body('subjectTasks.*.primaryScore').isNumeric(),
    body('subjectTasks.*.isDetailedAnswer').isBoolean(),
    body('subjectTasks.*.subThemes').isArray({ min: 1 }),
    body('subjectTasks.*.subThemes.*').isObject(),
    body('subjectTasks.*.subThemes.*.id').isNumeric().optional(),
    body('subjectTasks.*.subThemes.*.subTheme').isString().notEmpty().isLength({ max: 75 }),
    body('durationMinutes').isNumeric(),
    body('isMark').isBoolean(),
    body('isPublished').isBoolean(),
    validationMiddleware,
    subjectTasksMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    // permissionMiddleware(PERMISSIONS.UPDATE_SUBJECTS),
    subjectController.updateSubject
);

subjectsRouter.get(
    '/:id',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    // permissionMiddleware(PERMISSIONS.SUBJECTS),
    subjectController.getSubjectFullInfo
);

subjectsRouter.delete(
    '/:id/archive',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    // permissionMiddleware(PERMISSIONS.DELETE_SUBJECTS),
    subjectController.archiveSubject
);

// право на восстановление предмета?
subjectsRouter.put(
    '/:id/restore',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    // permissionMiddleware(PERMISSIONS.ARCHIVE),
    subjectController.restoreSubject
);

subjectsRouter.delete(
    '/:id',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    // permissionMiddleware(PERMISSIONS.DELETE_SUBJECTS),
    subjectController.deleteSubject
);
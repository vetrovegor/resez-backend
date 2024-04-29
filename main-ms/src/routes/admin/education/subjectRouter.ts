import { Router } from "express";
import { body, param } from "express-validator";

import { subjectTasksMiddleware } from "../../../middlewares/subjectTasksMiddleware";
import { accessTokenMiddleware } from "../../../middlewares/accessTokenMiddleware";
import { blockedMiddleware } from "../../../middlewares/blockedMiddleware";
import subjectController from "../../../controllers/education/subjectController";
import { validationMiddleware } from "../../../middlewares/validationMiddleware";
import { permissionMiddleware } from "../../../middlewares/permissionMiddleware";
import { Permissions } from "types/permission";
import { subjectBodyMiddleware } from "../../../middlewares/education/subjectBodyMiddleware";
import scoreConversionController from "../../../controllers/education/scoreConversionController";
import { paginationMiddleware } from "../../../middlewares/paginationMiddleware";

export const subjectsRouter = Router();

subjectsRouter.post(
    '/',
    subjectBodyMiddleware,
    validationMiddleware,
    subjectTasksMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.CreateSubjects),
    subjectController.createSubject
);

subjectsRouter.get(
    '/',
    paginationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.Subjects),
    subjectController.getSubjects
);

subjectsRouter.patch(
    '/:id',
    param('id').isNumeric(),
    subjectBodyMiddleware,
    body('subjectTasks.*.id').isNumeric().optional(),
    body('subjectTasks.*.subThemes.*.id').isNumeric().optional(),
    validationMiddleware,
    subjectTasksMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.UpdateSubjects),
    subjectController.updateSubject
);

subjectsRouter.get(
    '/:slug',
    // param('id').isNumeric(),
    // validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.Subjects),
    subjectController.getSubjectFullInfo
);

subjectsRouter.delete(
    '/:id/archive',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.DeleteSubjects),
    subjectController.archiveSubject
);

subjectsRouter.patch(
    '/:id/restore',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.Archive),
    subjectController.restoreSubject
);

subjectsRouter.delete(
    '/:id',
    param('id').isNumeric(),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.DeleteSubjects),
    subjectController.deleteSubject
);

subjectsRouter.post(
    '/:id/score-conversion',
    param('id').isNumeric()
        .withMessage('Идентификатор предмета должен быть числовым'),
    body('scoreConversion').isArray({ min: 1 })
        .withMessage('scoreConversion должен быть массивом с минимальной длиной 1'),
    body('scoreConversion.*.primaryScore').isNumeric().optional()
        .withMessage('primaryScore должен быть числовым значением (опционально)'),
    body('scoreConversion.*.secondaryScore').isNumeric().optional()
        .withMessage('secondaryScore должен быть числовым значением (опционально)'),
    body('scoreConversion.*.minScore').isNumeric().optional()
        .withMessage('minScore должен быть числовым значением (опционально)'),
    body('scoreConversion.*.maxScore').isNumeric().optional()
        .withMessage('maxScore должен быть числовым значением (опционально)'),
    body('scoreConversion.*.grade').isNumeric().optional()
        .withMessage('grade должен быть числовым значением (опционально)'),
    body('scoreConversion.*.isRed').isBoolean()
        .withMessage('isRed должен быть логическим значением'),
    body('scoreConversion.*.isGreen').isBoolean()
        .withMessage('isGreen должен быть логическим значением'),
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.CreateSubjects),
    scoreConversionController.saveScoreConversion
);

subjectsRouter.get(
    '/:id/score-conversion',
    validationMiddleware,
    accessTokenMiddleware,
    blockedMiddleware,
    permissionMiddleware(Permissions.CreateSubjects),
    scoreConversionController.getScoreConversion
);
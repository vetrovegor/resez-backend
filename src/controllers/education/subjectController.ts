import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import { ApiError } from '../../apiError';
import { PaginationQuery, RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery, WithId } from 'types/request';
import { SubjectBodyDTO } from 'types/education';
import subjectService from '../../services/education/subjectService';

class SubjectController {
    async createSubject(req: RequestWithBody<SubjectBodyDTO>, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.validationError(errors.array()));
            }

            const { subject, subjectTasks, durationMinutes, isMark, isPublished } = req.body;

            const createdSubject = await subjectService.createSubject(
                subject,
                subjectTasks,
                durationMinutes,
                isMark,
                isPublished
            );

            res.json({ subject: createdSubject });
        } catch (error) {
            next(error);
        }
    }
    
    async updateSubject(req: RequestWithParamsAndBody<WithId, SubjectBodyDTO>, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.validationError(errors.array()));
            }

            const { subject, subjectTasks, durationMinutes, isMark, isPublished } = req.body;

            const updatedSubject = await subjectService.updateSubject(
                req.params.id,
                subject,
                subjectTasks,
                durationMinutes,
                isMark,
                isPublished
            );

            res.json({ subject: updatedSubject });
        } catch (error) {
            next(error);
        }
    }
    
    async getSubjectFullInfo(req: RequestWithParams<WithId>, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.validationError(errors.array()));
            }

            const subject = await subjectService.getSubjectFullInfo(req.params.id);

            res.json({ subject });
        } catch (error) {
            next(error);
        }
    }

    async archiveSubject(req: RequestWithParams<WithId>, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.validationError(errors.array()));
            }
            
            const subject = await subjectService.setSubjectArchiveStatus(req.params.id, true);

            res.json({ subject });
        } catch (error) {
            next(error);
        }
    }

    async restoreSubject(req: RequestWithParams<WithId>, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.validationError(errors.array()));
            }
            
            const subject = await subjectService.setSubjectArchiveStatus(req.params.id, false);

            res.json({ subject });
        } catch (error) {
            next(error);
        }
    }

    async getArchivedSubjects(req: RequestWithQuery<PaginationQuery>, res: Response, next: NextFunction) {
        try {
            const { limit, offset } = req.query;

            const data = await subjectService.getArchivedSubjects(limit, offset);

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async deleteSubject(req: RequestWithParams<WithId>, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.validationError(errors.array()));
            }

            const subject = await subjectService.deleteSubject(req.params.id);

            res.json({ subject });
        } catch (error) {
            next(error);
        }
    }
}

export default new SubjectController();
import { Request, Response, NextFunction } from 'express';

import { PaginationQuery, RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery, IdParam } from 'types/request';
import { SubjectBodyDTO } from 'types/education';
import subjectService from '../../services/education/subjectService';

class SubjectController {
    async createSubject(req: RequestWithBody<SubjectBodyDTO>, res: Response, next: NextFunction) {
        try {
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
    
    async getSubjects(req: Request, res: Response, next: NextFunction) {
        try {
            const subjects = await subjectService.getSubjects();

            res.json(subjects);
        } catch (error) {
            next(error);
        }
    }
    
    async updateSubject(req: RequestWithParamsAndBody<IdParam, SubjectBodyDTO>, res: Response, next: NextFunction) {
        try {
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
    
    async getSubjectFullInfo(req: RequestWithParams<IdParam>, res: Response, next: NextFunction) {
        try {
            const subject = await subjectService.getSubjectFullInfo(req.params.id);

            res.json({ subject });
        } catch (error) {
            next(error);
        }
    }

    async archiveSubject(req: RequestWithParams<IdParam>, res: Response, next: NextFunction) {
        try {            
            const subject = await subjectService.setSubjectArchiveStatus(req.params.id, true);

            res.json({ subject });
        } catch (error) {
            next(error);
        }
    }

    async restoreSubject(req: RequestWithParams<IdParam>, res: Response, next: NextFunction) {
        try {            
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

    async deleteSubject(req: RequestWithParams<IdParam>, res: Response, next: NextFunction) {
        try {
            const subject = await subjectService.deleteSubject(req.params.id);

            res.json({ subject });
        } catch (error) {
            next(error);
        }
    }
}

export default new SubjectController();
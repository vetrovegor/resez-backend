import { Op } from 'sequelize';

import Subject from '../../db/models/education/Subject';
import { ApiError } from '../../ApiError';
import { SubjectShortInfo, SubjectTaskBodyDTO } from 'types/education';
import subjectTaskService from './subjectTaskService';
import scoreConversionService from './scoreConversionService';
import { PaginationDTO } from '../../dto/PaginationDTO';

class SubjectService {
    async getSubjectById(subjectId: number): Promise<Subject> {
        const subject = await Subject.findByPk(subjectId);

        if (!subject) {
            this.throwSubjectNotFoundError();
        }

        return subject;
    }
    async getSubjectBySlug(slug: string): Promise<Subject> {
        const subject = await Subject.findOne({
            where: { slug }
        });

        if (!subject) {
            this.throwSubjectNotFoundError();
        }

        return subject;
    }

    async createSubject(
        subject: string,
        slug: string,
        subjectTasks: SubjectTaskBodyDTO[],
        durationMinutes: number,
        isMark: boolean,
        isPublished: boolean
    ): Promise<SubjectShortInfo> {
        const existedSubject = await this.getSubjectBySlug(slug);

        if (existedSubject) {
            this.throwSubjectAlreadyExistsError();
        }

        const createdSubject = await Subject.create({
            subject,
            slug,
            isPublished,
            durationMinutes,
            isMark
        });

        await subjectTaskService.createSubjectTasks(
            subjectTasks,
            createdSubject.id
        );

        return await createdSubject.toShortInfo();
    }

    async getSubjects(): Promise<SubjectShortInfo[]> {
        const subjects = await Subject.findAll();

        return await Promise.all(
            subjects.map(async subject => await subject.toShortInfo())
        );
    }

    async updateSubject(
        subjectId: number,
        subject: string,
        slug: string,
        subjectTasks: SubjectTaskBodyDTO[],
        durationMinutes: number,
        isMark: boolean,
        isPublished: boolean
    ): Promise<SubjectShortInfo> {
        const subjectData = await this.getSubjectById(subjectId);

        const existedSubject = await Subject.findOne({
            where: {
                id: { [Op.ne]: subjectId },
                slug
            }
        });

        if (existedSubject) {
            this.throwSubjectAlreadyExistsError();
        }

        if (subjectData.isMark != isMark) {
            await scoreConversionService.deleteScoreConversionBySubjectId(
                subjectId
            );
        }

        subjectData.set('subject', subject);
        subjectData.set('slug', slug);
        subjectData.set('durationMinutes', durationMinutes);
        subjectData.set('isMark', isMark);
        subjectData.set('isPublished', isPublished);
        await subjectData.save();

        await subjectTaskService.updateSubjectTasks(subjectTasks, subjectId);

        return await subjectData.toShortInfo();
    }

    async getSubjectFullInfo(slug: string) {
        const subject = await this.getSubjectBySlug(slug);

        return subject.toFullInfo();
    }

    // добавить сюда id пользователя который архивирует роль
    async setSubjectArchiveStatus(
        subjectId: number,
        status: boolean
    ): Promise<SubjectShortInfo> {
        const subject = await this.getSubjectById(subjectId);

        subject.set('isArchived', status);
        await subject.save();

        return await subject.toShortInfo();
    }

    async getArchivedSubjects(
        limit: number,
        offset: number
    ): Promise<PaginationDTO<SubjectShortInfo>> {
        const subjects = await Subject.findAll({
            where: {
                isArchived: true
            },
            limit,
            offset
        });

        const subjectDTOs = await Promise.all(
            subjects.map(async subject => await subject.toShortInfo())
        );

        const totalCount = await Subject.count({
            where: {
                isArchived: true
            }
        });

        return new PaginationDTO<SubjectShortInfo>(
            'subjects',
            subjectDTOs,
            totalCount,
            limit,
            offset
        );
    }

    async deleteSubject(subjectId: number): Promise<SubjectShortInfo> {
        const subject = await this.getSubjectById(subjectId);

        // довести до ума (сделать чтобы работало каскадное удаление)
        await scoreConversionService.deleteScoreConversionBySubjectId(
            subjectId
        );

        await subject.destroy();

        return await subject.toShortInfo();
    }

    throwSubjectNotFoundError() {
        throw ApiError.badRequest('Предмет не найден');
    }

    throwSubjectAlreadyExistsError() {
        throw ApiError.badRequest('Предмет с таким slug уже существует');
    }
}

export default new SubjectService();

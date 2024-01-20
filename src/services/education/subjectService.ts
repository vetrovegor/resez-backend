import { Op } from "sequelize";

import Subject from "../../db/models/education/Subject";
import { ApiError } from "../../ApiError";
import { SubjectShortInfo, SubjectTaskBodyDTO } from "types/education";
import subjectTaskService from "./subjectTaskService";
import scoreConversionService from "./scoreConversionService";
import { PaginationDTO } from "../../dto/PaginationDTO";

class SubjectService {
    async getSubjectById(subjectId: number): Promise<Subject> {
        const subject = await Subject.findByPk(subjectId);

        if (!subject) {
            throw ApiError.notFound('Предмет не найден');
        }

        return subject;
    }

    async createSubject(subject: string, subjectTasks: SubjectTaskBodyDTO[], durationMinutes: number, isMark: boolean, isPublished: boolean): Promise<SubjectShortInfo> {
        const existedSubject = await Subject.findOne({
            where: {
                subject
            }
        });

        if (existedSubject) {
            this.throwSubjectAlreadyExistsError();
        }

        const createdSubject = await Subject.create({
            subject,
            isPublished,
            durationMinutes,
            isMark
        });

        await subjectTaskService.createSubjectTasks(subjectTasks, createdSubject.id);

        return await createdSubject.toShortInfo();
    }

    async getSubjects(): Promise<SubjectShortInfo[]> {
        const subjects = await Subject.findAll();

        return await Promise.all(
            subjects.map(async subject =>
                await subject.toShortInfo()
            )
        );
    }

    async updateSubject(subjectId: number, subject: string, subjectTasks: SubjectTaskBodyDTO[], durationMinutes: number, isMark: boolean, isPublished: boolean): Promise<SubjectShortInfo> {
        const subjectData = await this.getSubjectById(subjectId);

        const existedSubject = await Subject.findOne({
            where: {
                id: { [Op.ne]: subjectId },
                subject
            }
        });

        if (existedSubject) {
            this.throwSubjectAlreadyExistsError();
        }

        if (subjectData.isMark != isMark) {
            await scoreConversionService.deleteScoreConversionBySubjectId(subjectId);
        }

        subjectData.set('subject', subject);
        subjectData.set('durationMinutes', durationMinutes);
        subjectData.set('isMark', isMark);
        subjectData.set('isPublished', isPublished);
        await subjectData.save();

        await subjectTaskService.updateSubjectTasks(subjectTasks, subjectId);

        return await subjectData.toShortInfo();
    }

    async getSubjectFullInfo(subjectId: number) {
        const subject = await this.getSubjectById(subjectId);

        return subject.toFullInfo();
    }

    async setSubjectArchiveStatus(subjectId: number, status: boolean): Promise<SubjectShortInfo> {
        const subject = await this.getSubjectById(subjectId);

        subject.set('isArchive', status);
        await subject.save();

        return await subject.toShortInfo();
    }

    async getArchivedSubjects(limit: number, offset: number): Promise<PaginationDTO<SubjectShortInfo>> {
        const subjects = await Subject.findAll({
            where: {
                isArchive: true
            },
            limit,
            offset
        });

        const subjectDTOs = await Promise.all(
            subjects.map(
                async subject => await subject.toShortInfo()
            )
        );

        const totalCount = await Subject.count({
            where: {
                isArchive: true
            },
        });

        return new PaginationDTO<SubjectShortInfo>("subjects", subjectDTOs, totalCount, limit, offset);
    }

    async deleteSubject(subjectId: number): Promise<SubjectShortInfo> {
        const subject = await this.getSubjectById(subjectId);

        // довести до ума (сделать чтобы работало каскадное удаление)
        await scoreConversionService.deleteScoreConversionBySubjectId(subjectId);

        await subject.destroy();

        return await subject.toShortInfo();
    }

    throwSubjectAlreadyExistsError() {
        throw ApiError.badRequest('Предмет с таким названием уже существует');
    }
}

export default new SubjectService();
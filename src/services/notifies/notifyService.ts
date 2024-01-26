import { Op } from "sequelize";

import socketService from "../../services/socketService";
import Notify from "../../db/models/notifies/Notify";
import UserNotify from "../../db/models/notifies/UserNotify";
import { EmitTypes } from "types/socket";
import { PaginationDTO } from "../../dto/PaginationDTO";
import { ApiError } from "../../ApiError";
import { NotifyDTO } from "types/notify";

class NotifyService {
    async createUserNotify(userId: number, notifyId: number, date: string, isSent: boolean): Promise<UserNotify> {
        const userNotify = await UserNotify.create({
            userId,
            notifyId,
            date,
            isSent
        });

        if (isSent) {
            socketService.emitByUserId(
                userId,
                EmitTypes.Notify,
                { notify: await userNotify.toDTO() }
            );
        }

        return userNotify;
    }
    async sendNotifies(notifyTypeId: number, title: string, content: string,
        author: string, users: number[], date: string, isDelayed: boolean, senderId: number): Promise<void> {
        const notify = await Notify.create({
            notifyTypeId,
            title,
            content,
            author,
            senderId
        });

        for (const userId of users) {
            await this.createUserNotify(userId, notify.get('id'), date, !isDelayed);
        }
    }

    async sendDelayedNotifies(): Promise<void> {
        const notifiesToSend = await UserNotify.findAll({
            where: {
                isSent: false,
                date: {
                    [Op.lt]: Date.now()
                }
            }
        });

        for (const userNotify of notifiesToSend) {
            userNotify.set('isSent', true);
            userNotify.set('date', new Date());

            await userNotify.save();

            socketService.emitByUserId(
                userNotify.get('userId'),
                EmitTypes.Notify,
                { notify: await userNotify.toDTO() }
            );
        }
    }

    async getUserNotifies(userId: number, limit: number, offset: number, unread?: string): Promise<PaginationDTO<NotifyDTO>> {
        const whereOptions: {
            userId: number;
            isSent: boolean;
            date: { [Op.lt]: Date };
            isRead?: boolean;
        } = {
            userId,
            isSent: true,
            date: {
                [Op.lt]: new Date()
            }
        };

        if (unread && unread.toLowerCase() === 'true') {
            whereOptions.isRead = false;
        }

        const userNotifies = await UserNotify.findAll({
            where: whereOptions,
            order: [['date', 'DESC']],
            limit,
            offset
        });

        const notifiesDTOs = await Promise.all(
            userNotifies.map(async userNotify => {
                return await userNotify.toDTO();
            })
        );

        const totalCount = await UserNotify.count({ where: whereOptions });

        return new PaginationDTO<NotifyDTO>("notifies", notifiesDTOs, totalCount, limit, offset);
    }

    async readNotify(userId: number, notifyId: number): Promise<NotifyDTO> {
        const userNotify = await UserNotify.findOne({
            where: {
                userId,
                notifyId,
                isRead: false,
                isSent: true
            }
        });

        if (!userNotify) {
            throw ApiError.notFound('Уведомление не найдено');
        }

        userNotify.set('isRead', true);
        await userNotify.save();

        return await userNotify.toDTO();
    }

    async readAllNotifies(userId: number, limit: number, offset: number) {
        await UserNotify.update({ isRead: true }, {
            where: {
                userId,
                isRead: false,
                isSent: true
            }
        });

        return await this.getUserNotifies(userId, limit, offset);
    }
}

export default new NotifyService();
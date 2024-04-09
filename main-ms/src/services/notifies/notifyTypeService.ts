import { Op } from "sequelize";

import NotifyType from "../../db/models/notifies/NotifyType";
import { NotifyTypes } from "types/notify";
import { ApiError } from "../../ApiError";

const initialTypes: string[] = [
    NotifyTypes.Info,
    NotifyTypes.Session,
    NotifyTypes.Gift,
    NotifyTypes.Votting,
    NotifyTypes.Adding
];

class NotifyTypeService {
    async initNotifyTypes() {
        initialTypes.forEach(async (type) => {
            const existedType = await NotifyType.findOne({
                where: {
                    type
                }
            });

            if (!existedType) {
                await NotifyType.create({
                    type
                });
            }
        });

        return await NotifyType.destroy({
            where: {
                type: {
                    [Op.notIn]: initialTypes
                }
            }
        });
    }

    async getNotifyTypes() {
        return await NotifyType.findAll();
    }

    async getNotifyTypeIdByType(type: string): Promise<number> {
        const notifyType = await NotifyType.findOne({
            where: {
                type
            }
        });

        return notifyType.get('id');
    }

    async getNotifyTypeById(id: number): Promise<NotifyType> {
        const notifyType = await NotifyType.findByPk(id);

        if (!notifyType) {
            throw ApiError.notFound('Тип уведомления не найден');
        }

        return notifyType;
    }
}

export default new NotifyTypeService();
import { Request, Response, NextFunction } from 'express';

import promoCodeService from '../services/promoCodeService';
import {
    IdParam,
    PaginationQuery,
    RequestWithBodyAndUser,
    RequestWithParams,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from 'types/request';
import { PromoCodeBodyDTO } from 'types/promoCode';

class PromoCodeController {
    async createPromoCode(
        req: RequestWithBodyAndUser<PromoCodeBodyDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { code, expiredDate, limit, xp, coins } = req.body;

            const promoCode = await promoCodeService.createPromoCode(
                code,
                expiredDate,
                limit,
                xp,
                coins,
                req.user.id
            );

            res.json({ promoCode });
        } catch (error) {
            next(error);
        }
    }

    async activatePromoCode(
        req: RequestWithBodyAndUser<{ code: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const reward = await promoCodeService.activatePromoCode(
                req.body.code,
                req.user.id
            );

            res.json({ reward });
        } catch (error) {
            next(error);
        }
    }

    async getPromocodes(
        req: RequestWithQuery<PaginationQuery & { active: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const data = await promoCodeService.getPromocodes(
                req.query.limit,
                req.query.offset,
                req.query.active
            );

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async getPromocodeById(
        req: RequestWithParams<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const promocode = await promoCodeService.getPromocodeDtoById(
                req.params.id
            );

            res.json({ promocode });
        } catch (error) {
            next(error);
        }
    }

    async getUsersByPromocodeId(
        req: RequestWithParamsAndQuery<IdParam, PaginationQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const data = await promoCodeService.getUsersByPromocodeId(
                req.params.id,
                req.query.limit,
                req.query.offset
            );

            res.json(data);
        } catch (error) {
            next(error);
        }
    }
}

export default new PromoCodeController();

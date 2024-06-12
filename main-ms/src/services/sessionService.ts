import { Request } from 'express';
import geoip from 'geoip-lite';
import { Details } from 'express-useragent';
import { Op } from 'sequelize';

import { UserTokenInfo } from 'types/user';
import {
    ReqInfo,
    SessionDTO,
    SessionPagination,
    SessionSaveResult
} from 'types/session';
import tokenService from './tokenService';
import Session from '../db/models/Session';
import { PaginationDTO } from '../dto/PaginationDTO';
import { ApiError } from '../ApiError';
import socketService from './socketService';
import rmqService from './rmqService';

class SessionService {
    // добавить параметр shouldCreateNotify
    async saveSession(
        req: Request,
        userTokenInfo: UserTokenInfo
    ): Promise<SessionSaveResult> {
        const { id: userId, telegramChatId } = userTokenInfo;
        const sessionData = await this.findCurrentSession(req, userId);

        const date = Date.now();
        const expiredDate = date + 30 * 24 * 60 * 60 * 1000;
        let sessionId;

        if (sessionData) {
            // if (!sessionData.get("isActive")) {
            // await notifyService.createSessionNotify('В ваш аккаунт был выполнен вход', sessionData);
            // }

            await sessionData.update({
                isActive: true,
                date,
                expiredDate
            });

            sessionId = sessionData.id;
        } else {
            const newSession = await this.createSession(
                req,
                userId,
                true,
                new Date(date),
                new Date(expiredDate)
            );

            sessionId = newSession.id;

            // if (shouldCreateNotify) {
            //     await notifyService.createSessionNotify('В ваш аккаунт был выполнен вход с нового устройства', newSession);
            //     await logService.createNewDeviceLoginLogEntry(userId, sessionId);
            // }

            if (telegramChatId) {
                rmqService.sendToQueue('telegram', 'new-session', {
                    telegramChatId,
                    session: newSession
                });
            }
        }

        const { accessToken, refreshToken } =
            tokenService.generateTokens(userTokenInfo);
        tokenService.saveToken(refreshToken, sessionId);

        return {
            sessionId,
            accessToken,
            refreshToken
        };
    }

    async createSession(
        req: Request,
        userId: number,
        isActive: boolean,
        date: Date,
        expiredDate: Date
    ): Promise<Session> {
        const reqInfo = this.getReqInfo(req);
        const {
            ip,
            country,
            city,
            deviceType,
            browser,
            browserVersion,
            os,
            platform
        } = reqInfo;

        return await Session.create({
            userId,
            isActive,
            date,
            expiredDate,
            ip,
            deviceType,
            country,
            city,
            browser,
            browserVersion,
            os,
            platform
        });
    }

    async endCurrentSession(req: Request, userId: number): Promise<Session> {
        const currentSession = await this.findCurrentSession(req, userId);

        if (currentSession) {
            await tokenService.deleteTokenBySessionId(currentSession.id);

            return await currentSession.update({
                isActive: false
            });
        }

        const date = new Date();

        return await this.createSession(req, userId, false, date, date);
    }

    async findCurrentSession(req: Request, userId: number): Promise<Session> {
        const {
            ip,
            country,
            city,
            browser,
            browserVersion,
            os,
            platform,
            deviceType
        } = this.getReqInfo(req);

        return await Session.findOne({
            where: {
                userId,
                ip,
                country,
                city,
                browser,
                browserVersion,
                os,
                platform,
                deviceType
            }
        });
    }

    getReqInfo(req: Request): ReqInfo {
        let { ip } = req;
        ip = ip.replace('::ffff:', '');
        const geoData = geoip.lookup(ip);
        const { country = null, city = null } = geoData || {};
        const { useragent } = req;
        let { browser, version: browserVersion, os, platform } = useragent;
        browser = browser != 'unknown' ? browser : null;
        browserVersion = browserVersion != 'unknown' ? browserVersion : null;
        os = os != 'unknown' ? os : null;
        platform = platform != 'unknown' ? platform : null;
        const deviceType = this.detectDeviceType(useragent);

        return {
            ip,
            country,
            city,
            browser,
            browserVersion,
            os,
            platform,
            deviceType
        };
    }

    detectDeviceType(useragent: Details): string {
        if (useragent.isBot) {
            return 'bot';
        } else if (useragent.isSmartTV) {
            return 'tv';
        } else if (useragent.isMobile) {
            return 'mobile';
        } else if (useragent.isTablet) {
            return 'tablet';
        } else if (useragent.isDesktop) {
            return 'desktop';
        }

        return null;
    }

    async findOrCreateCurrentSession(
        req: Request,
        userId: number
    ): Promise<Session> {
        const currentSession = await this.findCurrentSession(req, userId);

        if (!currentSession) {
            const date = Date.now();
            const expiredDate = date + 30 * 24 * 60 * 60 * 1000;
            return await this.createSession(
                req,
                userId,
                true,
                new Date(date),
                new Date(expiredDate)
            );
        }

        return currentSession;
    }

    // типизировать
    async getUserSessions(
        req: Request,
        userId: number,
        limit: number,
        offset: number
    ) {
        const currentSession = await this.findOrCreateCurrentSession(
            req,
            userId
        );

        const whereOptions = {
            id: {
                [Op.ne]: currentSession.id
            },
            userId
        };

        const otherSessions = await Session.findAll({
            where: whereOptions,
            order: [['date', 'DESC']],
            limit,
            offset
        });

        const otherSessionDTOs = otherSessions.map(session => session.toDTO());

        const otherTotalCount = await Session.count({
            where: whereOptions
        });

        const paginationDTO = new PaginationDTO<SessionDTO>(
            'other',
            otherSessionDTOs,
            otherTotalCount,
            limit,
            offset
        );

        return {
            current: currentSession.toDTO(),
            ...paginationDTO
        };
    }

    async endSessionById(id: number, userId?: number): Promise<void> {
        const session = await Session.findByPk(id);

        console.log({ userId, sessionUserId: session.get('userId') });

        if (!session || (userId && session.get('userId') != userId)) {
            throw ApiError.notFound('Сессия не найдена');
        }

        await session.update({
            isActive: false
        });

        await tokenService.deleteTokenBySessionId(id);

        // socketService.emitEndSession(id);
        rmqService.sendToQueue('socket-queue', 'emit-end-session', id);
    }

    // типизировать
    async endAllSessions(
        req: Request,
        userId: number,
        limit: number,
        offset: number
    ) {
        const currentSession = await this.findOrCreateCurrentSession(
            req,
            userId
        );

        const sessions = await Session.findAll({
            where: {
                id: {
                    [Op.ne]: currentSession.id
                },
                userId,
                isActive: true
            }
        });

        for (const session of sessions) {
            await session.update({
                isActive: false,
                tokenId: null
            });

            await tokenService.deleteTokenBySessionId(session.id);

            // socketService.emitEndSession(session.get('id'));
            rmqService.sendToQueue('socket-queue', 'emit-end-session', session.get('id'));
        }

        return this.getUserSessions(req, userId, limit, offset);
    }
}

export default new SessionService();

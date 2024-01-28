import { Response, NextFunction, Request } from 'express';

import authService from '../services/authService';
import { RequestWithBody, RequestWithParams, RequestWithUser } from 'types/request';
import { UserAuthDTO, UserRecoveryPasswordDTO } from 'types/user';
import sessionService from '../services/sessionService';
import codeService from '../services/codeService';
import userService from '../services/userService';
import { CodeAuthParam } from 'types/code';

class AuthController {
    async register(req: RequestWithBody<UserAuthDTO>, res: Response, next: NextFunction) {
        try {
            const { nickname, password } = req.body;

            const { user, verificationCodeData } = await authService.register(nickname, password);

            const { accessToken, refreshToken, sessionId } = await sessionService.saveSession(req, user.toTokenInfo());

            res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

            res.json({
                accessToken,
                sessionId,
                user: await user.toShortInfo(),
                verificationCodeData
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: RequestWithBody<UserAuthDTO>, res: Response, next: NextFunction) {
        try {
            const { nickname, password } = req.body;

            const { user, verificationCodeData } = await authService.login(nickname, password);

            const { accessToken, refreshToken, sessionId } = await sessionService.saveSession(req, user.toTokenInfo());

            res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

            res.json({
                accessToken,
                sessionId,
                user: await user.toShortInfo(),
                verificationCodeData
            });
        } catch (error) {
            next(error);
        }
    }

    // отрефакторить
    async loginByCode(req: RequestWithParams<CodeAuthParam>, res: Response, next: NextFunction) {
        try {
            const user = await codeService.verifyAuthCode(req.params.code);

            const { accessToken, refreshToken, sessionId } = await sessionService.saveSession(req, user.toTokenInfo());

            res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

            res.json({
                accessToken,
                sessionId,
                user: await user.toShortInfo()
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;

            await sessionService.endCurrentSession(req, id);

            res.clearCookie('refreshToken').send();
        } catch (error) {
            next(error);
        }
    }

    async checkAuth(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async refresh(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const { accessToken, refreshToken } = await sessionService.saveSession(req, req.user);

            res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

            res.json({
                accessToken
            });
        } catch (error) {
            next(error);
        }
    }

    async sendVerificationCode(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const verificationCodeData = await codeService.createVerificationCode(req.user.id);

            res.send({
                verificationCodeData
            });
        } catch (error) {
            next(error);
        }
    }

    async sendRecoveryPasswordCode(req: RequestWithBody<UserRecoveryPasswordDTO>, res: Response, next: NextFunction) {
        try {
            const { nickname } = req.body;

            await codeService.sendRecoveryPasswordCode(nickname);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async verifyRecoveryPasswordCode(req: RequestWithBody<UserRecoveryPasswordDTO>, res: Response, next: NextFunction) {
        try {
            const { nickname, code } = req.body;

            await codeService.verifyRecoveryPasswordCode(nickname, code);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async recoveryPassword(req: RequestWithBody<UserRecoveryPasswordDTO>, res: Response, next: NextFunction) {
        try {
            const { nickname, code, password } = req.body;

            await codeService.verifyRecoveryPasswordCode(nickname, code);
            await userService.recoveryPassword(nickname, password);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
import { Response, NextFunction, Request } from 'express';
import { UploadedFile } from 'express-fileupload';

import codeService from '../services/codeService';
import userService from '../services/userService';
import sessionService from '../services/sessionService';
import {
    IdParam,
    PaginationQuery,
    RequestWithBody,
    RequestWithBodyAndUser,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndBodyAndUser,
    RequestWithParamsAndUser,
    RequestWithQueryAndUser,
    RequestWithUser
} from 'types/request';
import {
    UserChangePasswordDTO,
    UserFiltersQuery,
    UserProfileInfo,
    UserSearchQuery,
    UserSettingsInfo
} from 'types/user';

class UserhController {
    async getUserShortInfo(
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user.id;

            const user = await userService.getUserShortInfo(userId);
            const { id: sessionId } = await sessionService.findCurrentSession(
                req,
                userId
            );

            res.json({ user, sessionId });
        } catch (error) {
            next(error);
        }
    }

    async getUserPermissions(
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ) {
        try {
            const permissions = await userService.getUserPermissions(
                req.user.id
            );
            res.json({ permissions });
        } catch (error) {
            next(error);
        }
    }

    async sendChangePasswordCode(
        req: RequestWithBodyAndUser<UserChangePasswordDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { oldPassword } = req.body;

            await codeService.sendChangePasswordCode(req.user.id, oldPassword);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async verifyChangePasswordCode(
        req: RequestWithBodyAndUser<UserChangePasswordDTO>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { id } = req.user;
            const { oldPassword, newPassword, code } = req.body;

            await codeService.verifyChangePasswordCode(id, code);
            await userService.changePassword(id, oldPassword, newPassword);

            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async getProfileInfo(
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ) {
        try {
            const user = await userService.getProfileInfo(req.user.id);

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(
        req: RequestWithBodyAndUser<UserProfileInfo>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { firstName, lastName, birthDate, gender } = req.body;

            const user = await userService.updateProfile(
                req.user.id,
                firstName,
                lastName,
                birthDate,
                gender
            );

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    async updateSettings(
        req: RequestWithBodyAndUser<UserSettingsInfo>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { isPrivateAccount, isHideAvatars } = req.body;

            const settings = await userService.updateSettings(
                req.user.id,
                isPrivateAccount,
                isHideAvatars
            );

            res.json({ settings });
        } catch (error) {
            next(error);
        }
    }

    // типизировать запрос, который будет принимать картинку
    async setAvatar(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const user = await userService.setAvatar(
                req.user.id,
                req.files.avatar as UploadedFile
            );

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    async deleteAvatar(
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ) {
        try {
            const user = await userService.deleteAvatar(req.user.id);

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    async setAvatarDecoration(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const user = await userService.setAvatarDecoration(
                req.params.id,
                req.user.id
            );

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    async deleteAvatarDecoration(
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ) {
        try {
            const user = await userService.deleteAvatarDecoration(req.user.id);

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    async getUser(
        req: RequestWithParams<{ nickname: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const user = await userService.getUser(req.params.nickname);
            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    async searchUsers(
        req: RequestWithQueryAndUser<PaginationQuery & UserSearchQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { search, limit, offset } = req.query;

            const data = await userService.searchUsers(
                req.user.id,
                search,
                limit,
                offset
            );

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await userService.getStats();
            res.json({ stats });
        } catch (error) {
            next(error);
        }
    }

    async getUsers(
        req: RequestWithQueryAndUser<PaginationQuery & UserFiltersQuery>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const {
                limit,
                offset,
                search,
                blocked,
                verified,
                online,
                has_role: hasRole,
                role: roleId,
                ids,
                short
            } = req.query;

            const data = await userService.getUsers(
                limit,
                offset,
                search,
                blocked,
                verified,
                online,
                hasRole,
                roleId,
                ids,
                short
            );

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    async blockUser(
        req: RequestWithParamsAndBodyAndUser<IdParam, { reason?: string }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const user = await userService.setUserBlockStatus(
                req.user.id,
                req.params.id,
                true,
                req.body.reason
            );

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    async unblockUser(
        req: RequestWithParamsAndUser<IdParam>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const user = await userService.setUserBlockStatus(
                req.user.id,
                req.params.id,
                false
            );

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    async increaseXP(
        req: RequestWithBody<{ nickname: string; xp: number }>,
        res: Response,
        next: NextFunction
    ) {
        const { nickname, xp } = req.body;

        const user = await userService.increaseXP(nickname, xp);

        res.json({ user });
    }

    async addCoins(
        req: RequestWithParamsAndBody<IdParam, { amount: number }>,
        res: Response,
        next: NextFunction
    ) {
        try {
            const user = await userService.addCoins(
                req.params.id,
                Number(req.body.amount)
            );

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserhController();

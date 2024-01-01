import { Response, NextFunction } from 'express';

import codeService from '../services/codeService';
import userService from '../services/userService';
import sessionService from '../services/sessionService';
import { RequestWithBodyAndUser, RequestWithUser } from 'types/request';
import { UserChangePasswordDTO, UserProfileInfo } from 'types/user';

class UserhController {
    async getUserShortInfo(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            
            const user = await userService.getUserShortInfo(userId);
            const { id: sessionId } = await sessionService.findCurrentSession(req, userId);

            res.json({ user, sessionId });
        } catch (error) {
            next(error);
        }
    }

    async sendChangePasswordCode(req: RequestWithBodyAndUser<UserChangePasswordDTO>, res: Response, next: NextFunction) {
        try {
            const { oldPassword } = req.body;

            await codeService.sendChangePasswordCode(req.user.id, oldPassword);

            res.send(200);
        } catch (error) {
            next(error);
        }
    }

    async verifyChangePasswordCode(req: RequestWithBodyAndUser<UserChangePasswordDTO>, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;
            const { oldPassword, newPassword, code } = req.body;

            await codeService.verifyChangePasswordCode(id, code);
            await userService.changePassword(id, oldPassword, newPassword);

            res.send(200);
        } catch (error) {
            next(error);
        }
    }

    async getProfileInfo(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const user = await userService.getProfileInfo(req.user.id);

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req: RequestWithBodyAndUser<UserProfileInfo>, res: Response, next: NextFunction) {
        try {
            const { firstName, lastName, birthDate, gender } = req.body;

            const user = await userService.updateProfile(req.user.id, firstName, lastName, birthDate, gender);

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    async setAvatar(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            // типизировать
            const user = await userService.setAvatar(req.user.id, req.files.avatar);

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    async deleteAvatar(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const user = await userService.deleteAvatar(req.user.id);

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserhController();
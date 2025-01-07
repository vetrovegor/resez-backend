import jwt, { JwtPayload } from 'jsonwebtoken';

import { UserTokenInfo } from 'src/types/user';
import Token from '@db/models/Token';
import { Tokens } from 'src/types/session';
import User from '@db/models/User';
import { v4 } from 'uuid';

class TokenService {
    generateTokens(payload: UserTokenInfo): Tokens {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: process.env.JWT_ACCESS_EXPIRATION
        });
        const refreshToken = v4();

        return {
            accessToken,
            refreshToken
        };
    }

    async saveToken(token: string, userId: number, sessionId: number): Promise<Token> {
        const existedToken = await Token.findOne({
            where: {
                userId,
                sessionId
            }
        });

        if (existedToken) {
            existedToken.set('token', token);
            return await existedToken.save();
        }

        return await Token.create({
            token,
            userId,
            sessionId
        });
    }

    async deleteTokenBySessionId(sessionId: number) {
        return await Token.destroy({
            where: {
                sessionId
            }
        });
    }

    validateToken(token: string) {
        const data = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET
        ) as UserTokenInfo & JwtPayload;

        delete data.iat;
        delete data.exp;

        return {
            ...data
        };
    }

    async validateRefreshToken(token: string) {
        const tokenData = await Token.findOne({
            where: {
                token
            },
            include: User
        });

        const user = tokenData.get('user');

        return await user.toTokenInfo();
    }
}

export default new TokenService();

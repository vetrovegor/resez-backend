import jwt, { JwtPayload } from 'jsonwebtoken';

import { UserTokenInfo } from 'types/user';
import Token from '../db/models/Token';
import { Tokens } from 'types/session';

class TokenService {
    generateTokens(payload: UserTokenInfo): Tokens {
        console.log({ payload });
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: process.env.JWT_ACCESS_EXPIRATION
        });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRATION
        });

        return {
            accessToken,
            refreshToken
        };
    }

    async saveToken(token: string, sessionId: number): Promise<Token> {
        const existedToken = await Token.findOne({
            where: {
                sessionId
            }
        });

        if (existedToken) {
            existedToken.set('token', token);
            return await existedToken.save();
        }

        return await Token.create({
            token,
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

    async findTokenByToken(token: string) {
        return await Token.findOne({
            where: {
                token
            }
        });
    }
}

export default new TokenService();

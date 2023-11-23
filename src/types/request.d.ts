import { Request } from 'express';

import { UserTokenInfo } from './user';

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithQuery<T> = Request<{}, {}, {}, T>;
export type RequestWithParams<T> = Request<T>;
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>;

// отрефакторить
// переименовать в RequestWithUser и в остальных
export type RequestWithUserTokenInfo = Request & { user: UserTokenInfo };

// подумать как исправить (еслм с & RequestWithUserTokenInfo, то не подсказывает поля)
export type RequestWithBodyAndUserTokenInfo<T> = RequestWithBody<T> & { user: UserTokenInfo };

export type PaginationParams = {
    limit: number,
    offset: number
}

export type RequestWithQueryAndUserTokenInfo<T> = RequestWithQuery<T> & { user: UserTokenInfo };

// подумать над другим названием
export type WithId = {
    id: number
}

export type RequestWithParamsAndUserTokenInfo<T> = RequestWithParams<T> & { user: UserTokenInfo };

export type RequestWithParamsAndBodyAndUser<P, B> = Request<P, {}, B> & { user: UserTokenInfo };
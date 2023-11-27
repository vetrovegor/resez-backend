import { Request } from 'express';

import { UserTokenInfo } from './user';

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithQuery<T> = Request<{}, {}, {}, T>;
export type RequestWithParams<T> = Request<T>;
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>;

export type RequestWithUser = Request & { user: UserTokenInfo };

export type RequestWithBodyAndUser<T> = RequestWithBody<T> & { user: UserTokenInfo };

export type PaginationParams = {
    limit: number,
    offset: number
}

export type RequestWithQueryAndUser<T> = RequestWithQuery<T> & { user: UserTokenInfo };

// подумать над другим названием
export type WithId = {
    id: number
}

export type RequestWithParamsAndUser<T> = RequestWithParams<T> & { user: UserTokenInfo };

export type RequestWithParamsAndBodyAndUser<P, B> = RequestWithParamsAndBody<P, B> & { user: UserTokenInfo };
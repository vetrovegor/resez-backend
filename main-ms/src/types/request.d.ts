import { Request } from 'express';

import { UserTokenInfo } from './user';

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithQuery<T> = Request<{}, {}, {}, T>;
export type RequestWithParams<T> = Request<T>;
export type RequestWithParamsAndBody<P, B> = Request<P, {}, B>;

export type RequestWithUser = Request & { user: UserTokenInfo };

export type RequestWithBodyAndUser<T> = RequestWithBody<T>
    & { user: UserTokenInfo };

export type PaginationQuery = {
    limit: number,
    offset: number
}

export type RequestWithQueryAndUser<T> = RequestWithQuery<T>
    & { user: UserTokenInfo };

export type IdParam = {
    id: number
}

export type RequestWithParamsAndUser<T> = RequestWithParams<T>
    & { user: UserTokenInfo };

export type RequestWithParamsAndBodyAndUser<P, B> = RequestWithParamsAndBody<P, B>
    & { user: UserTokenInfo };

export type RequestWithParamsAndQuery<P, Q> = RequestWithParams<P> & RequestWithQuery<Q>
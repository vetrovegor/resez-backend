import { Request } from 'express';

import { UserTokenInfo } from './user';

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithQuery<T> = Request<{}, {}, {}, T>;
export type RequestWithParams<T> = Request<T>;
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>;

export type RequestWithUserTokenInfo = Request & { user: UserTokenInfo };

export type RequestWithBodyAndUserTokenInfo<T> = RequestWithBody<T> & RequestWithUserTokenInfo;

export type PaginationParams = {
    limit: number,
    offset: number
}

export type RequestWithQueryAndUserTokenInfo<T> = RequestWithQuery<T> & RequestWithUserTokenInfo;

// подумать над другим названием
export type WithId = {
    id: number
}

export type RequestWithParamsAndUserTokenInfo<T> = RequestWithParams<T> & RequestWithUserTokenInfo;
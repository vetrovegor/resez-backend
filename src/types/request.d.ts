import { Request } from 'express';

import { UserTokenInfo } from './user';

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithQuery<T> = Request<{}, {}, {}, T>;
export type RequestWithParams<T> = Request<T>;
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>;

export type RequestWithUserTokenInfo = Request & { user: UserTokenInfo };

export type RequestWithBodyAndUserTokenInfo<T> = RequestWithBody<T> & { user: UserTokenInfo };
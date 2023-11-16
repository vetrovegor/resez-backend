export type Tokens = {
    accessToken: string,
    refreshToken: string
}

export type ReqInfo = {
    ip: string,
    country: string,
    city: string,
    deviceType: string,
    browser: string,
    browserVersion: string,
    os: string,
    platform: string
}

export type SessionSaveResult = {
    sessionId: number;
    accessToken: string;
    refreshToken: string;
}
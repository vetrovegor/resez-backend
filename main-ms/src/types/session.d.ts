import { PaginationDTO } from "dto/PaginationDTO"

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

export type SessionDTO = {
    id: number;
    isActive: boolean;
    date: Date;
    ip: string;
    deviceType: string;
    country: string;
    city: string;
    browser: string;
    browserVersion: string;
    os: string;
    platform: string;
}

export type SessionPagination = PaginationDTO<SessionDTO> & {
    current: SessionDTO
}
export type ConnectedUser = {
    socketId: string,
    uniqueId: string
}

export type AuthConnectedUser = {
    socketId: string,
    userId: string,
    sessionId: string
}

export const enum EventTypes {
    Join = 'join',
    Leave = 'leave',
    Stats = 'stats',
    Disconnect = 'disconnect'
}
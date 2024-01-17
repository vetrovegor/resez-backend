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

export const enum EmitTypes {
    Verify = 'verify',
    VerifyCodeUpdated = 'verify-code-updated',
    Notify = 'notify',
    EndSession = 'end-session',
    Blocked = 'blocked',
    Unblocked = 'unblocked',
    Message = 'message',
    NewPermissions = 'new-permissions',
    Auth = 'auth'
}
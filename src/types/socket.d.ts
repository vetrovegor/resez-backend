export type ConnectedUser = {
    socketId: string,
    uniqueId: string
}

export type AuthConnectedUser = {
    userId: number,
    socketId: string
}

export const enum Events {
    Join = 'join',
    Leave = 'leave',
    Stats = 'stats',
    Disconnect = 'disconnect'
}

export const enum Emits {
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
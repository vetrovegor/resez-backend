export interface User {
    socketId: string;
    uniqueId: string;
}

export interface AuthUser {
    socketId: string;
    userId: string;
    sessionId: string;
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
    MessagesDeleting = 'messages-deleting',
    RoleUpdated = 'role-updated',
    Auth = 'auth',
    NewLevel = 'new-level',
    Achievement = 'achievement'
}

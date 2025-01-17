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
    MessageUpdating = 'messages-updating',
    MessageReading = 'messages-reading',
    Typing = 'typing',
    ChatUpdated = 'chat-updated',
    Refresh = 'refresh',
    Auth = 'auth',
    NewLevel = 'new-level',
    Achievement = 'achievement'
}

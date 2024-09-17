export interface User {
    socketId: string;
    userId: string;
}

export const enum EventTypes {
    Join = 'join',
    Leave = 'leave'
}

export const enum EmitTypes {
    EmptyUserId = 'empty-user-id',
    UserNotFound = 'user-not-found',
    IncorrectBattleId = 'incorrect-battle-id',
    BattleNotFound = 'battle-not-found',
    BattleFull = 'battle-full',
    BattleJoined = 'battle-joined'
}

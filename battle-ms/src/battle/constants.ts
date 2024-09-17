export interface User {
    socketId: string;
    userId: string;
}

export interface UserBattle {
    userId: string;
    battleId: string;
}

export const enum EventTypes {
    Join = 'join',
    Leave = 'leave'
}

export const enum EmitTypes {
    EmptyUserId = 'empty-user-id',
    IncorrectBattleId = 'incorrect-battle-id',
    UserNotFound = 'user-not-found',
    BattleNotFound = 'battle-not-found',
    BattleFull = 'battle-full',
    BattleJoined = 'battle-joined'
}

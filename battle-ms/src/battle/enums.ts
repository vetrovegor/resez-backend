export const enum EventTypes {
    Join = 'join',
    Leave = 'leave',
    ToggleReady = 'toggle-ready'
}

export const enum EmitTypes {
    Connected = 'connected',
    UserNotFound = 'user-not-found',
    BattleNotFound = 'battle-not-found',
    AlreadyInBattle = 'already-in-battle',
    BattleFull = 'battle-full',
    UserJoined = 'user-joined',
    BattleJoined = 'battle-joined',
    UserLeaved = 'user-leaved',
    UserToggleReady = 'user-toggle-ready'
}

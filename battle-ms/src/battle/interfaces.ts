export interface User {
    socketId: string;
    id: number;
    nickname: string;
    avatar: string;
}

export interface UserBattle {
    socketId: string;
    userId: number;
    battleId: number;
    isReady: boolean;
    isLeader: boolean;
}

export interface BattleDeleteTimeout {
    battleId: number;
    timeout: NodeJS.Timeout;
}

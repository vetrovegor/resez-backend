export interface User {
    socketId: string;
    id: number;
    nickname: string;
    avatar: string;
}

export interface UserBattle {
    userId: number;
    battleId: number;
    status: 'waiting' | 'ready';
}

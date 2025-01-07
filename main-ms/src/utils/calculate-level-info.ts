import { LevelInfo } from 'src/types/user';

const XP_INCREASE_FACTOR = 10;
const BASE_XP = 490;

const calculateLevelXpLimit = (level: number): number => {
    return XP_INCREASE_FACTOR * level * level + BASE_XP;
};

export const calculateLevelInfo = (xp: number): LevelInfo => {
    let level = 1;
    let limit = calculateLevelXpLimit(level);

    while (xp >= limit) {
        xp -= limit;
        level++;
        limit = calculateLevelXpLimit(level);
    }

    return {
        level,
        xp,
        limit
    };
};

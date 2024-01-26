import { LevelInfo } from "types/user";

const XPIncreaseFactor = 10;
const baseXP = 490;

const calculateLevelXpLimit = (level: number): number => {
    return XPIncreaseFactor * level * level + baseXP;
}

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
}
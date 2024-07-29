export const arraysEqualSet = (arr1: any[], arr2: any[]) => {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    if (set1.size !== set2.size) return false;

    for (const item of set1) {
        if (!set2.has(item)) return false;
    }

    return true;
};

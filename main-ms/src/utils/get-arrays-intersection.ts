export const getArraysIntersection = (arrays: any[][]) => {
    if (arrays.length === 0) {
        return [];
    }

    const intersection = arrays[0].filter((value) => {
        return arrays.every((array) => array.includes(value));
    });

    return intersection;
}
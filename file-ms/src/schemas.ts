export const uploadFile = {
    body: {
        type: 'object',
        required: ['file'],
        properties: {
            file: { isFile: true }
        }
    }
};

const adduser = {
    body: {
        type: 'object',
        required: ['nickname'],
        properties: {
            nickname: { type: 'string' },
            age: { type: 'number', default: 0 }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                created: { type: 'boolean' }
            }
        }
    }
};
module.exports = { adduser };

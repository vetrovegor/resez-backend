import request from 'supertest';
import express from 'express';

const app = express();

app.get('/hello', (req, res) => res.sendStatus(200));

describe('hello endpoints', () => {
    it('get /hello and expect 200', async () => {
        const response = await request(app).get('/hello');

        expect(response.statusCode).toBe(200);
    });
});

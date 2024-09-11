import request from 'supertest';

import { app } from '../../build/index';

it('GET /api/health - должно вернуть статус 200', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
});

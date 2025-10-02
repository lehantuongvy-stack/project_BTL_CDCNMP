const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  test('GET /api/health should return ok', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toEqual({ ok: true });
  });
});
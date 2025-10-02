const request = require('supertest');
const app = require('../src/app');

describe('Reports API', () => {
  test('GET /api/reports/low-stock should return low stock items', async () => {
    const response = await request(app)
      .get('/api/reports/low-stock')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/reports/inventory should return inventory snapshot', async () => {
    const response = await request(app)
      .get('/api/reports/inventory')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/reports/receipts should return receipt summary', async () => {
    const response = await request(app)
      .get('/api/reports/receipts')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/reports/usage should return usage summary', async () => {
    const response = await request(app)
      .get('/api/reports/usage')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });
});
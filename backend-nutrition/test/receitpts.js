const request = require('supertest');
const app = require('../src/app');

describe('Receipts API', () => {
  let createdReceiptId;
  let ingredientId;

  beforeAll(async () => {
    // Tạo ingredient để test
    const ingredientResponse = await request(app)
      .post('/api/ingredients')
      .send({
        name: 'Test Receipt Ingredient ' + Date.now(),
        unit: 'kg',
        min_threshold: 5
      });
    
    if (ingredientResponse.status === 201) {
      ingredientId = ingredientResponse.body.id;
    }
  });

  test('GET /api/receipts should return receipts list', async () => {
    const response = await request(app)
      .get('/api/receipts')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/receipts should create new receipt', async () => {
    if (!ingredientId) {
      console.log('Skipping receipt creation test - no ingredient available');
      return;
    }

    const receiptData = {
      supplier: 'Nhà cung cấp Test',
      items: [
        {
          ingredient_id: ingredientId,
          qty: 10,
          price: 50000
        }
      ]
    };

    const response = await request(app)
      .post('/api/receipts')
      .send(receiptData)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    createdReceiptId = response.body.id;
  });

  test('GET /api/receipts/:id should return specific receipt', async () => {
    if (!createdReceiptId) return;
    
    const response = await request(app)
      .get(`/api/receipts/${createdReceiptId}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('supplier');
    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);
  });
});
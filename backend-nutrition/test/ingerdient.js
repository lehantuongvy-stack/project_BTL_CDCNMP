const request = require('supertest');
const app = require('../src/app');

describe('Ingredients API', () => {
  let createdIngredientId;

  test('GET /api/ingredients should return ingredients list', async () => {
    const response = await request(app)
      .get('/api/ingredients')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/ingredients should create new ingredient', async () => {
    const ingredientData = {
      name: 'Test Ingredient ' + Date.now(), // Unique name
      unit: 'kg',
      min_threshold: 10
    };

    const response = await request(app)
      .post('/api/ingredients')
      .send(ingredientData)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    createdIngredientId = response.body.id;
  });

  test('PUT /api/ingredients/:id/stock should update stock', async () => {
    if (!createdIngredientId) return;
    
    const stockData = {
      quantity: 50,
      min_threshold: 15
    };

    const response = await request(app)
      .put(`/api/ingredients/${createdIngredientId}/stock`)
      .send(stockData)
      .expect(200);
    
    expect(response.body).toHaveProperty('message', 'Đã cập nhật kho');
  });
});
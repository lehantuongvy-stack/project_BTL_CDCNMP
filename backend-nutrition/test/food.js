const request = require('supertest');
const app = require('../src/app');

describe('Foods API', () => {
  let createdFoodId;

  test('GET /api/foods should return array', async () => {
    const response = await request(app)
      .get('/api/foods')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/foods should create a new food', async () => {
    const foodData = {
      name: 'Test Food ' + Date.now(), // Unique name
      description: 'Test food description',
      group_name: 'Test Group',
      kcal: 130,
      price: 15000
    };

    const response = await request(app)
      .post('/api/foods')
      .send(foodData)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    createdFoodId = response.body.id;
  });

  test('GET /api/foods/:id should return specific food', async () => {
    if (!createdFoodId) return;
    
    const response = await request(app)
      .get(`/api/foods/${createdFoodId}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('id', createdFoodId);
  });

  test('PUT /api/foods/:id should update food', async () => {
    if (!createdFoodId) return;
    
    const updateData = {
      kcal: 150,
      price: 20000
    };

    const response = await request(app)
      .put(`/api/foods/${createdFoodId}`)
      .send(updateData)
      .expect(200);
    
    expect(response.body).toHaveProperty('message', 'Đã cập nhật');
  });

  test('DELETE /api/foods/:id should deactivate food', async () => {
    if (!createdFoodId) return;
    
    const response = await request(app)
      .delete(`/api/foods/${createdFoodId}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('message', 'Đã ẩn món (inactive)');
  });
});
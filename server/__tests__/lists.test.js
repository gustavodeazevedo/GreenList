const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const List = require('../models/List');

let mongoServer;
let token;
let userId;

beforeAll(async () => {
  // Set up an in-memory MongoDB server for testing
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create a test user and generate a token
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });
  
  userId = user._id;
  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'test_secret', {
    expiresIn: '1h',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the List collection before each test
  await List.deleteMany({});
});

describe('Shopping List API', () => {
  test('should create a new list', async () => {
    const res = await request(app)
      .post('/api/lists')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Groceries',
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'Groceries');
    expect(res.body).toHaveProperty('owner', userId.toString());
    expect(res.body).toHaveProperty('items');
    expect(res.body.items).toHaveLength(0);
  });

  test('should get all lists for the user', async () => {
    // Create some lists for the user
    await List.create({
      name: 'Groceries',
      owner: userId,
      items: [],
    });
    
    await List.create({
      name: 'Hardware Store',
      owner: userId,
      items: [],
    });

    const res = await request(app)
      .get('/api/lists')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('name', 'Groceries');
    expect(res.body[1]).toHaveProperty('name', 'Hardware Store');
  });

  test('should get a specific list by ID', async () => {
    // Create a list
    const list = await List.create({
      name: 'Groceries',
      owner: userId,
      items: [
        { name: 'Milk', quantity: 1, unit: 'liter', completed: false },
        { name: 'Bread', quantity: 2, unit: 'unit', completed: true },
      ],
    });

    const res = await request(app)
      .get(`/api/lists/${list._id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Groceries');
    expect(res.body).toHaveProperty('items');
    expect(res.body.items).toHaveLength(2);
    expect(res.body.items[0]).toHaveProperty('name', 'Milk');
    expect(res.body.items[1]).toHaveProperty('name', 'Bread');
    expect(res.body.items[1]).toHaveProperty('completed', true);
  });

  test('should update a list', async () => {
    // Create a list
    const list = await List.create({
      name: 'Groceries',
      owner: userId,
      items: [],
    });

    const res = await request(app)
      .put(`/api/lists/${list._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Groceries',
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Updated Groceries');
  });

  test('should delete a list', async () => {
    // Create a list
    const list = await List.create({
      name: 'Groceries',
      owner: userId,
      items: [],
    });

    const res = await request(app)
      .delete(`/api/lists/${list._id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    
    // Verify the list was deleted
    const foundList = await List.findById(list._id);
    expect(foundList).toBeNull();
  });

  test('should add an item to a list', async () => {
    // Create a list
    const list = await List.create({
      name: 'Groceries',
      owner: userId,
      items: [],
    });

    const res = await request(app)
      .post(`/api/lists/${list._id}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Milk',
        quantity: 1,
        unit: 'liter',
        completed: false
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Milk');
    expect(res.body).toHaveProperty('quantity', 1);
    expect(res.body).toHaveProperty('unit', 'liter');
    expect(res.body).toHaveProperty('completed', false);
    
    // Verify the item was added to the list
    const updatedList = await List.findById(list._id);
    expect(updatedList.items).toHaveLength(1);
    expect(updatedList.items[0].name).toBe('Milk');
  });

  test('should update an item in a list', async () => {
    // Create a list with an item
    const list = await List.create({
      name: 'Groceries',
      owner: userId,
      items: [
        { name: 'Milk', quantity: 1, unit: 'liter', completed: false }
      ],
    });

    const itemId = list.items[0]._id;

    const res = await request(app)
      .put(`/api/lists/${list._id}/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Organic Milk',
        quantity: 2,
        completed: true
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Organic Milk');
    expect(res.body).toHaveProperty('quantity', 2);
    expect(res.body).toHaveProperty('unit', 'liter'); // Unit should remain unchanged
    expect(res.body).toHaveProperty('completed', true);
    
    // Verify the item was updated
    const updatedList = await List.findById(list._id);
    expect(updatedList.items[0].name).toBe('Organic Milk');
    expect(updatedList.items[0].completed).toBe(true);
  });

  test('should delete an item from a list', async () => {
    // Create a list with an item
    const list = await List.create({
      name: 'Groceries',
      owner: userId,
      items: [
        { name: 'Milk', quantity: 1, unit: 'liter', completed: false }
      ],
    });

    const itemId = list.items[0]._id;

    const res = await request(app)
      .delete(`/api/lists/${list._id}/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    
    // Verify the item was deleted
    const updatedList = await List.findById(list._id);
    expect(updatedList.items).toHaveLength(0);
  });

  test('should share a list with another user', async () => {
    // Create another user
    const anotherUser = await User.create({
      name: 'Another User',
      email: 'another@example.com',
      password: 'password123',
    });

    // Create a list
    const list = await List.create({
      name: 'Groceries',
      owner: userId,
      items: [],
    });

    const res = await request(app)
      .post(`/api/lists/${list._id}/share`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'another@example.com'
      });
    
    expect(res.statusCode).toEqual(200);
    
    // Verify the list was shared
    const updatedList = await List.findById(list._id);
    expect(updatedList.sharedWith).toContainEqual(anotherUser._id);
  });

  test('should not share a list with a non-existent user', async () => {
    // Create a list
    const list = await List.create({
      name: 'Groceries',
      owner: userId,
      items: [],
    });

    const res = await request(app)
      .post(`/api/lists/${list._id}/share`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'nonexistent@example.com'
      });
    
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  test('should allow a shared user to access the list', async () => {
    // Create another user
    const anotherUser = await User.create({
      name: 'Another User',
      email: 'another@example.com',
      password: 'password123',
    });

    // Create a list and share it
    const list = await List.create({
      name: 'Groceries',
      owner: userId,
      items: [],
      sharedWith: [anotherUser._id]
    });

    // Generate token for the other user
    const anotherToken = jwt.sign({ id: anotherUser._id }, process.env.JWT_SECRET || 'test_secret', {
      expiresIn: '1h',
    });

    const res = await request(app)
      .get(`/api/lists/${list._id}`)
      .set('Authorization', `Bearer ${anotherToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Groceries');
  });
});
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');

let server;

test('API Endpoints', async (t) => {
  // Setup
  await t.before(async () => {
    return new Promise((resolve) => {
      server = app.listen(3001, () => {
        console.log('Test server started on port 3001');
        resolve();
      });
    });
  });

  // Teardown
  await t.after(async () => {
    return new Promise((resolve) => {
      server.close(() => {
        console.log('Test server closed');
        resolve();
      });
    });
  });

  await t.test('create table with fields', async () => {
    const response = await request(server)
      .post('/create-table/testdb')
      .send({
        fields: {
          name: 'TEXT',
          age: 'INTEGER'
        }
      });
    
    assert.equal(response.status, 201);
    assert.equal(response.body.message, 'Table created successfully');
  });

  await t.test('insert entry into table', async () => {
    const response = await request(server)
      .post('/entries/testdb')
      .send({
        data: JSON.stringify({
          name: 'John Doe',
          age: 30
        })
      });
    
    assert.equal(response.status, 201);
    assert.ok(response.body.id);
  });

  await t.test('get all entries', async () => {
    const response = await request(server)
      .get('/entries/testdb');
    
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));
    assert.equal(response.body.length, 1);
    assert.equal(response.body[0].name, 'John Doe');
    assert.equal(response.body[0].age, 30);
  });

  await t.test('delete entry and verify', async () => {
    const deleteResponse = await request(server)
      .delete('/entries/testdb/1');
    
    assert.equal(deleteResponse.status, 204);

    const getResponse = await request(server)
      .get('/entries/testdb');
    assert.equal(getResponse.body.length, 0);
  });
});

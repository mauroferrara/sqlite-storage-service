const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const app = require('../server');

test('API Endpoints', async (t) => {
  let db;

  // Setup
  t.before(() => {
    db = new sqlite3.Database(':memory:');
    app.locals.db = db;
  });

  // Teardown
  t.after(() => {
    db.close();
  });

  await t.test('create table with specified fields and types', async () => {
    const response = await request(app)
      .post('/create-table/testdb')
      .send({ fields: { name: 'TEXT', age: 'INTEGER' } });
    
    assert.equal(response.status, 201);
    assert.ok(response.body.message.includes('Table created successfully'));
  });

  await t.test('insert an entry into the table', async () => {
    const response = await request(app)
      .post('/entries/testdb')
      .send({ data: JSON.stringify({ name: 'John', age: 30 }) });
    
    assert.equal(response.status, 201);
    assert.ok(response.body.id);
  });

  await t.test('retrieve all entries from the table', async () => {
    const response = await request(app)
      .get('/entries/testdb');
    
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));
  });

  await t.test('delete an entry from the table', async () => {
    const response = await request(app)
      .delete('/entries/testdb/1');
    
    assert.equal(response.status, 204);
  });
});

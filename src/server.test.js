import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, listen } from './server.js';

let server;

test('API Endpoints', async (t) => {
  // Setup
  t.before(async () => {
    server = await new Promise((resolve) => {
      const srv = listen(3001, () => {
        console.log('Test server started on port 3001');
        resolve(srv);
      });
    });
  });

  // Teardown
  t.after(async () => {
    await new Promise((resolve) => {
      server.close(() => {
        console.log('Test server closed');
        resolve();
      });
    });
  });

  await t.test('create table with fields', async () => {
    const response = await request(app)
      .post('/create/testdb')
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
    const response = await request(app)
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
    const response = await request(app)
      .get('/entries/testdb');
    
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));
  });

  await t.test('list available databases', async () => {
    const response = await request(app)
      .get('/dbs');
    
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));
    assert.ok(response.body.includes('testdb'));
  });

  await t.test('delete entry', async () => {
    // First create an entry to delete
    const createResponse = await request(app)
      .post('/entries/testdb')
      .send({
        data: JSON.stringify({
          name: 'To Delete',
          age: 25
        })
      });
    
    const idToDelete = createResponse.body.id;
    
    // Delete the entry
    const deleteResponse = await request(app)
      .delete(`/entries/testdb/${idToDelete}`);
    assert.equal(deleteResponse.status, 204);
    
    // Verify it's gone
    const getResponse = await request(app)
      .get('/entries/testdb');
    const deletedEntry = getResponse.body.find(entry => entry.id === idToDelete);
    assert.equal(deletedEntry, undefined);
  });
});

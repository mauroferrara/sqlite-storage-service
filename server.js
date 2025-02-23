const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

function openDb(dbName) {
  if (process.env.NODE_ENV === 'test') {
    if (!global.testDb) {
      global.testDb = new sqlite3.Database(':memory:');
    }
    return global.testDb;
  }
  return new sqlite3.Database(`./dbs/${dbName}.db`);
}

// Create table with specified fields and types
app.post('/create-table/:db', (req, res) => {
  try {
    const { db } = req.params;
    const { fields } = req.body;
    console.log('Creating table in database:', db, 'with fields:', fields);
    const database = openDb(db);

    const columns = Object.entries(fields).map(([key, type]) => `${key} ${type}`).join(', ');
    const createTableQuery = `CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY, ${columns})`;

    database.run(createTableQuery, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Table created successfully' });
    });

    if (process.env.NODE_ENV !== 'test') {
      database.close();
    }
  } catch (error) {
    console.error('Error in create-table:', error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD operations with a database parameter
app.post('/entries/:db', (req, res) => {
  const { db } = req.params;
  const { data } = req.body;
  const database = openDb(db);

  const payload = JSON.parse(data);
  const keys = Object.keys(payload);

  const placeholders = '?' + ', ?'.repeat(keys.length - 1);
  const values = keys.map(key => payload[key]);
  const insertQuery = `INSERT INTO entries (${keys.join(', ')}) VALUES (${placeholders})`;

  database.run(insertQuery, values, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    console.log(`A row has been inserted with rowid ${this.lastID}`);
    res.status(201).json({ id: this.lastID, ...payload });
  });

  if (process.env.NODE_ENV !== 'test') {
    database.close();
  }
});

app.get('/entries/:db', (req, res) => {
  const { db } = req.params;
  const database = openDb(db);

  database.all("SELECT * FROM entries", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });

  if (process.env.NODE_ENV !== 'test') {
    database.close();
  }
});

app.delete('/entries/:db/:id', (req, res) => {
  const { db, id } = req.params;
  const database = openDb(db);

  database.run("DELETE FROM entries WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(204).end();
  });

  if (process.env.NODE_ENV !== 'test') {
    database.close();
  }
});

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app;

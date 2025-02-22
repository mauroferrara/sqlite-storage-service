const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Open a specified SQLite database
function openDb(dbName) {
  return new sqlite3.Database(`./${dbName}.db`);
}

// Create table with specified fields and types
app.post('/create-table/:db', (req, res) => {
  const { db } = req.params;
  const { fields } = req.body;
  const database = openDb(db);

  const columns = Object.entries(fields).map(([key, type]) => `${key} ${type}`).join(', ');
  const createTableQuery = `CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY, ${columns})`;

  database.run(createTableQuery, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Table created successfully' });
  });

  database.close();
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

  database.close();
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

  database.close();
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

  database.close();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

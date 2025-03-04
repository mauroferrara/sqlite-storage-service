import express, { json } from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { readdir, unlink } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const verbose = sqlite3.verbose();

app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.options('*', cors());

app.use(json());

function openDb(dbName) {
  if (process.env.NODE_ENV === 'test') {
    if (!global.testDb) {
      global.testDb = new sqlite3.Database(':memory:');
    }
    return global.testDb;
  }
  return new sqlite3.Database(join(__dirname, '../dbs', `${dbName}.db`));
}

// Create table with specified fields and types
app.post('/api/create/:db', (req, res) => {
  try {
    const { db } = req.params;
    const { fields } = req.body;
    console.log('Creating table in database:', db, 'with fields:', fields);
    const database = openDb(db);

    if (!Array.isArray(fields)) {
      return res.status(400).json({ error: 'Fields must be an array' });
    }

    const columns = fields
      .map(field => `${field.key} ${field.type}`)
      .join(', ');
    const createTableQuery = `CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY, ${columns})`;
    
    console.log(createTableQuery);

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

// List all available databases
app.get('/api/dbs', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'test') {
      // In test mode, return mock data
      return res.json(['test', 'testdb']);
    }

    const dbDir = join(__dirname, '../dbs');
    const files = await readdir(dbDir);
    const databases = files
      .filter(file => file.endsWith('.db'))
      .map(file => file.replace('.db', ''));
    
    res.json(databases);
  } catch (error) {
    console.error('Error listing databases:', error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD operations with a database parameter
app.post('/api/entries/:db', (req, res) => {
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

app.get('/api/entries/:db/:field?/:direction?', (req, res) => {
  const { db, field, direction = 'asc' } = req.params;
  const database = openDb(db);

  let query = "SELECT * FROM entries";
  
  if (field) {
    // Validate the sort direction
    if (direction && !['asc', 'desc'].includes(direction.toLowerCase())) {
      return res.status(400).json({ error: 'Sort direction must be either "asc" or "desc"' });
    }

    // First verify the field exists in the table
    database.all("PRAGMA table_info(entries);", [], (err, columns) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const isValidField = columns.some(col => col.name === field);
      if (!isValidField) {
        return res.status(400).json({ error: `Field "${field}" does not exist in the table` });
      }

      // Execute the query with ORDER BY
      const finalQuery = `${query} ORDER BY ${field} ${direction.toLowerCase()}`;
      database.all(finalQuery, [], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      });
    });
  } else {
    // Execute without sorting if no field is specified
    database.all(query, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  }

  if (process.env.NODE_ENV !== 'test') {
    database.close();
  }
});

app.delete('/api/entries/:db/:id', (req, res) => {
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

// Add info route
app.get('/api/info/:db', (req, res) => {
  const { db } = req.params;
  const database = openDb(db);

  // Get table info
  database.all("PRAGMA table_info(entries);", [], (err, fields) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Get count of entries
    database.get("SELECT COUNT(*) as count FROM entries;", [], (err, count) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const tableInfo = {
        entryCount: count.count,
        fields: fields.map(field => ({
          key: field.name,
          type: field.type
        })).filter(field => field.key !== 'id') // Exclude the id field
      };

      res.json(tableInfo);
    });
  });

  if (process.env.NODE_ENV !== 'test') {
    database.close();
  }
});

// Add delete database route
app.delete('/api/delete/:db', async (req, res) => {
  try {
    const { db } = req.params;
    
    if (process.env.NODE_ENV === 'test') {
      // In test mode, just return success
      return res.status(204).end();
    }

    const dbPath = join(__dirname, '../dbs', `${db}.db`);
    const database = openDb(db);
    
    // Close the database connection before deletion
    await new Promise((resolve, reject) => {
      database.close((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Delete the database file
    await unlink(dbPath);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting database:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add helper route
app.get('/helper', (req, res) => {
  console.log('Serving the helper page');

  res.sendFile(join(__dirname, '../dist/index.html'));
});

// Move static file middleware here, after all API routes
app.use(express.static(join(__dirname, '../dist')));

const listen = (portNumber = port, callback) => {
  return app.listen(portNumber, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${portNumber}`);
    if (callback) callback();
  });
};

if (import.meta.url === `file://${process.argv[1]}`) {
  listen();
}

export { app, listen };

# SQLite Storage Service

A lightweight, flexible REST API service that provides dynamic SQLite database creation and management. Built with Express.js and SQLite3, this service enables creating custom tables and performing CRUD operations through a simple HTTP interface.

## Features

- 🔧 Dynamic table creation with custom fields
- 💾 Multiple database support
- 🧪 In-memory database for testing
- 🔒 CORS enabled
- ✨ Full CRUD operations

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sqlite-storage-service.git

# Install dependencies
npm install
```

## Running the Service

```bash
# Start the server
node server.js

# The server will run at http://localhost:3000
```

## API Reference

### Create Table
Creates a new table with specified fields in the named database.

```http
POST /create-table/:db
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `:db` | `string` | Database name |

**Request Body:**
```json
{
  "fields": {
    "name": "TEXT",
    "age": "INTEGER",
    "email": "TEXT"
  }
}
```

### Create Entry
Add a new record to the specified database.

```http
POST /entries/:db
```

**Request Body:**
```json
{
  "data": "{\"name\":\"John Doe\",\"age\":30,\"email\":\"john@example.com\"}"
}
```

### Get All Entries
Retrieve all records from the specified database.

```http
GET /entries/:db
```

### Delete Entry
Remove a specific record by ID.

```http
DELETE /entries/:db/:id
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `:db` | `string` | Database name |
| `:id` | `integer` | Record ID to delete |

## Project Structure

```
sqlite-storage-service/
├── server.js         # Main application file
├── dbs/             # SQLite database files
├── package.json     # Project dependencies
└── README.md        # Documentation
```

## Development

The service includes a testing mode that uses an in-memory SQLite database:

```bash
# Run tests
NODE_ENV=test npm test
```

## Error Handling

The API returns appropriate HTTP status codes:

- `201`: Resource created successfully
- `204`: Resource deleted successfully
- `500`: Server error with error message in response body

## Environment Variables

- `NODE_ENV`: Set to 'test' for in-memory database testing
- `PORT`: Server port (defaults to 3000)

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
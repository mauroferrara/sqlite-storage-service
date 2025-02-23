<template>
  <div class="database-list">
    <h2>Available Databases</h2>
    <table class="database-table">
      <thead>
        <tr>
          <th>Database Name</th>
          <th>Entry Count</th>
          <th>Fields</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="db in databasesInfo" :key="db.name">
          <td>{{ db.name }}</td>
          <td>{{ db.info ? db.info.entryCount : 'Loading...' }}</td>
          <td>
            <div v-if="db.info" class="fields-list">
              <span v-for="field in db.info.fields" :key="field.key" class="field-tag">
                {{ field.key }}: {{ field.type }}
              </span>
            </div>
            <span v-else>Loading...</span>
          </td>
          <td>
            <button @click="selectDatabase(db.name)" class="visualize-btn">Visualize</button>
            <button @click="deleteDatabase(db.name)" class="delete-btn">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DatabaseList',
  data() {
    return {
      databasesInfo: []
    }
  },
  methods: {
    async fetchDatabases() {
      try {
        const response = await axios.get('/api/dbs');
        this.databasesInfo = response.data.map(db => ({ name: db, info: null }));
        
        // Fetch info for each database
        for (const db of this.databasesInfo) {
          try {
            const infoResponse = await axios.get(`/api/info/${db.name}`);
            db.info = infoResponse.data;
          } catch (error) {
            console.error(`Error fetching info for ${db.name}:`, error);
          }
        }
      } catch (error) {
        console.error('Error fetching databases:', error);
      }
    },
    selectDatabase(dbName) {
      this.$emit('database-selected', dbName);
    },
    async deleteDatabase(dbName) {
      if (confirm(`Are you sure you want to delete database "${dbName}"?`)) {
        try {
          await axios.delete(`/api/delete/${dbName}`);
          await this.fetchDatabases(); // Refresh the list
        } catch (error) {
          console.error('Error deleting database:', error);
        }
      }
    }
  },
  mounted() {
    this.fetchDatabases();
  }
}
</script>

<style scoped>
.database-list {
  margin: 20px;
}

.database-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.database-table th,
.database-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.database-table th {
  background-color: #f5f5f5;
}

button {
  padding: 6px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.fields-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.field-tag {
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.delete-btn {
  margin-left: 8px;
  background-color: #dc3545;
}

.delete-btn:hover {
  background-color: #c82333;
}

.visualize-btn {
  background-color: #17a2b8;
}

.visualize-btn:hover {
  background-color: #138496;
}
</style>

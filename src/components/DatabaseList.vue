<template>
  <div class="database-list">
    <h2>Available Databases ...</h2>
    <table class="database-table">
      <thead>
        <tr>
          <th>Database Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="db in databases" :key="db">
          <td>{{ db }}</td>
          <td>
            <button @click="selectDatabase(db)">Select</button>
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
      databases: []
    }
  },
  methods: {
    async fetchDatabases() {
      try {
        const response = await axios.get('/api/dbs');
        this.databases = response.data;
      } catch (error) {
        console.error('Error fetching databases:', error);
      }
    },
    selectDatabase(dbName) {
      this.$emit('database-selected', dbName);
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
</style>

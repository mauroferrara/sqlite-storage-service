<template>
  <div class="database-visualization">
    <div class="header">
      <button class="back-button" @click="$emit('back')">&larr; Back to Database List</button>
      <h2>{{ dbName }} Entries</h2>
    </div>

    <div v-if="entries.length === 0" class="no-data">
      No entries found in this database.
    </div>
    
    <table v-else class="entries-table">
      <thead>
        <tr>
          <th>ID</th>
          <th v-for="header in tableHeaders" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in entries" :key="entry.id">
          <td>{{ entry.id }}</td>
          <td v-for="header in tableHeaders" :key="header">{{ entry[header] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DatabaseVisualization',
  props: {
    dbName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      entries: [],
      tableHeaders: []
    }
  },
  methods: {
    async fetchEntries() {
      try {
        const response = await axios.get(`/api/entries/${this.dbName}`);
        this.entries = response.data;
        if (this.entries.length > 0) {
          this.tableHeaders = Object.keys(this.entries[0]).filter(key => key !== 'id');
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
      }
    }
  },
  mounted() {
    this.fetchEntries();
  }
}
</script>

<style scoped>
.database-visualization {
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  padding: 8px 16px;
  margin-right: 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #5a6268;
}

.entries-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.entries-table th,
.entries-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.entries-table th {
  background-color: #f5f5f5;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>

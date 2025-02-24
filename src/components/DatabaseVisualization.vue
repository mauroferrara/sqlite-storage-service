<template>
  <div class="database-visualization">
    <div class="header">
      <button class="back-button" @click="$emit('back')">&larr; Back to Database List</button>
      <h2>{{ dbName }} Entries</h2>
    </div>

    <div v-if="entries.length === 0" class="no-data">
      No entries found in this database.
    </div>
    
    <div v-else>
      <button class="export-btn" @click="exportToCSV">Export to CSV</button>
      <table class="entries-table">
        <thead>
          <tr>
            <th>ID</th>
            <th v-for="header in tableHeaders" :key="header" @click="toggleSort(header)">
              {{ header }}
              <span v-if="sortField === header" class="sort-icon">
                {{ sortDirection === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in entries" :key="entry.id">
            <td>{{ entry.id }}</td>
            <td v-for="header in tableHeaders" :key="header">{{ entry[header] }}</td>
            <td>
              <button class="delete-btn" @click="deleteEntry(entry.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
      tableHeaders: [],
      sortField: null,
      sortDirection: 'asc',
    }
  },
  methods: {
    async fetchEntries() {
      try {
        const sortParams = this.sortField ? `/${this.sortField}/${this.sortDirection}` : '';
        const response = await axios.get(`/api/entries/${this.dbName}${sortParams}`);
        this.entries = response.data;
        if (this.entries.length > 0) {
          this.tableHeaders = Object.keys(this.entries[0]).filter(key => key !== 'id');
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
      }
    },
    async deleteEntry(id) {
      if (confirm('Are you sure you want to delete this entry?')) {
        try {
          await axios.delete(`/api/entries/${this.dbName}/${id}`);
          await this.fetchEntries(); // Refresh the list
        } catch (error) {
          console.error('Error deleting entry:', error);
        }
      }
    },
    exportToCSV() {
      // Create CSV header
      const headers = ['id', ...this.tableHeaders];
      const csvContent = [
        headers.join(','),
        ...this.entries.map(entry => 
          headers.map(header => 
            JSON.stringify(entry[header] || '')
          ).join(',')
        )
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${this.dbName}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    toggleSort(field) {
      if (this.sortField === field) {
        // Toggle direction if same field
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // New field, default to ascending
        this.sortField = field;
        this.sortDirection = 'asc';
      }
      this.fetchEntries();
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
  cursor: pointer;
  user-select: none;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}

.delete-btn {
  padding: 6px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #c82333;
}

.export-btn {
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  float: right;
  margin-bottom: 10px;
}

.export-btn:hover {
  background-color: #218838;
}

.sort-icon {
  display: inline-block;
  margin-left: 4px;
}
</style>

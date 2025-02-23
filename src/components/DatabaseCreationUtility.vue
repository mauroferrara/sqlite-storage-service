<template>
  <div class="database-creator">
    <h1>Database Creation Utility</h1>
    
    <div class="form-group">
      <label for="dbName">Database Name:</label>
      <input 
        type="text" 
        id="dbName" 
        v-model="databaseName" 
        placeholder="Enter database name"
      >
    </div>

    <div class="fields-container">
      <h2>Database Fields</h2>
      <div v-for="(field, index) in fields" :key="index" class="field-row">
        <input 
          type="text" 
          v-model="field.key" 
          placeholder="Field name"
        >
        <select v-model="field.type">
          <option value="INTEGER">INTEGER</option>
          <option value="TEXT">TEXT</option>
          <option value="REAL">REAL</option>
          <option value="BLOB">BLOB</option>
          <option value="NUMERIC">NUMERIC</option>
        </select>
        <button @click="removeField(index)" class="remove-btn">Remove</button>
      </div>
      
      <button @click="addField" class="add-btn">Add New Field</button>
    </div>

    <button @click="handleSubmit" class="submit-btn">Create Database</button>
  </div>
</template>

<script lang="ts">
interface DatabaseField {
  key: string;
  type: 'INTEGER' | 'TEXT' | 'REAL' | 'BLOB' | 'NUMERIC';
}

export default {
  name: 'DatabaseCreationUtility',
  data() {
    return {
      databaseName: '',
      fields: [] as DatabaseField[]
    }
  },
  methods: {
    addField() {
      this.fields.push({
        key: '',
        type: 'TEXT'
      });
    },
    removeField(index: number) {
      this.fields.splice(index, 1);
    },
    async handleSubmit() {
      const requestBody = {
        fields: this.fields,
      };
      
      console.log('Submitting database creation request:', requestBody);
      
      try {
        const response = await fetch(`/api/create/${this.databaseName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create database');
        }
        
        // Clear form after successful submission
        this.databaseName = '';
        this.fields = [];
      } catch (error) {
        console.error('Error creating database:', error);
      }
    }
  }
}
</script>

<style scoped>
.database-creator {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

.field-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

input, select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-btn {
  margin-top: 10px;
  background-color: #4CAF50;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.remove-btn {
  background-color: #f44336;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  opacity: 0.8;
}

.submit-btn {
  margin-top: 20px;
  background-color: #2196F3;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
}
</style>

<template>
  <div id="app">
    <nav v-if="currentView !== 'database-visualization'">
      <button 
        @click="currentView = 'database-list'"
        :class="{ active: currentView === 'database-list' }"
      >
        Database List
      </button>
      <button 
        @click="currentView = 'database-creation-utility'"
        :class="{ active: currentView === 'database-creation-utility' }"
      >
        Database Creation Utility
      </button>
    </nav>

    <DatabaseList 
      v-if="currentView === 'database-list'"
      @database-selected="handleDatabaseSelection" 
    />
    <DatabaseCreationUtility v-if="currentView === 'database-creation-utility'" />
    <DatabaseVisualization
      v-if="currentView === 'database-visualization'"
      :dbName="selectedDatabase"
      @back="currentView = 'database-list'"
    />
  </div>
</template>

<script>
import DatabaseList from './components/DatabaseList.vue'
import DatabaseCreationUtility from './components/DatabaseCreationUtility.vue'
import DatabaseVisualization from './components/DatabaseVisualization.vue'

export default {
  name: 'App',
  components: {
    DatabaseList,
    DatabaseCreationUtility,
    DatabaseVisualization
  },
  data() {
    return {
      currentView: 'database-list',
      selectedDatabase: null
    }
  },
  methods: {
    handleDatabaseSelection(dbName) {
      this.selectedDatabase = dbName;
      this.currentView = 'database-visualization';
    }
  }
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
}

nav {
  background-color: #f8f9fa;
  padding: 1rem;
  margin-bottom: 2rem;
}

nav button {
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
}

nav button.active {
  color: #42b983;
  border-bottom: 2px solid #42b983;
}

nav button:hover {
  color: #42b983;
}
</style>

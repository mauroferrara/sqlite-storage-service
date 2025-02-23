<template>
  <div id="app">
    <nav>
      <button 
        @click="currentView = 'database-list'"
        :class="{ active: currentView === 'database-list' }"
      >
        Database List
      </button>
      <button 
        @click="currentView = 'hello-world'"
        :class="{ active: currentView === 'hello-world' }"
      >
        Hello World
      </button>
    </nav>

    <DatabaseList 
      v-if="currentView === 'database-list'"
      @database-selected="handleDatabaseSelection" 
    />
    <HelloWorld v-if="currentView === 'hello-world'" />
  </div>
</template>

<script>
import DatabaseList from './components/DatabaseList.vue'
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    DatabaseList,
    HelloWorld
  },
  data() {
    return {
      currentView: 'database-list'
    }
  },
  methods: {
    handleDatabaseSelection(dbName) {
      console.log('Selected database:', dbName);
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

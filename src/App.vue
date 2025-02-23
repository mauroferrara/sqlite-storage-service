<template>
  <div id="app">
    <DatabaseList @database-selected="handleDatabaseSelection" />
  </div>
</template>

<script>
import DatabaseList from './components/DatabaseList.vue'

export default {
  name: 'App',
  components: {
    DatabaseList
  },
  methods: {
    handleDatabaseSelection(dbName) {
      console.log('Selected database:', dbName);
      // Handle database selection here
    }
  }
}
</script>

<style>
h1 {
  color: #42b983;
}
</style>

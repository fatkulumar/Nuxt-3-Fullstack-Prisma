<template>
  <div class="container mx-auto">
    <p>
      Today's date comes from a plugin: <strong>{{ today }}</strong>
    </p>
  </div>
</template>
  
  <script setup>
// This is how you get data from a plugin
// plugins folder
const nuxtApp = useNuxtApp();
const today = nuxtApp.today;
</script>
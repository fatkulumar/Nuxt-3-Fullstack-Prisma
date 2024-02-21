<template>
  <div class="mx-auto container">
    <AdminHeader />
    <slot />
  </div>
</template>

<script setup lang="ts">
 import { initFlowbite } from 'flowbite'
 
definePageMeta({
  middleware: "auth",
});
</script>

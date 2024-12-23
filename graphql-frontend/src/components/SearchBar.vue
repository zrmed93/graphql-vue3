<template>
    <div class="mb-4">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Search products..."
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import { debounce } from 'lodash'
  
  interface Props {
    onSearch: (term: string) => void
  }
  
  const props = defineProps<Props>()
  
  const searchTerm = ref('')
  
  watch(searchTerm, debounce((newValue: string) => {
    props.onSearch(newValue)
  }, 300))
  </script>
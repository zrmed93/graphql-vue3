<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <select
      v-model="filters.categoryId"
      class="px-4 py-2 border rounded-lg"
      @change="emitFilters"
    >
      <option value="">All Categories</option>
      <option v-for="category in categories" :key="category.id" :value="category.id">
        {{ category.name }}
      </option>
    </select>

    <input
      type="number"
      v-model.number="filters.minPrice"
      placeholder="Min Price"
      class="px-4 py-2 border rounded-lg"
      @input="emitFilters"
    />

    <input
      type="number"
      v-model.number="filters.maxPrice"
      placeholder="Max Price"
      class="px-4 py-2 border rounded-lg"
      @input="emitFilters"
    />

    <button
      @click="clearFilters"
      class="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-100"
    >
      Clear Filters
    </button>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { CATEGORIES_QUERY } from '../graphql/queries'
import { Category, ProductFilters } from '../types';

const { result } = useQuery<{ categories: Category[] }>(CATEGORIES_QUERY)
const categories = computed(() => result.value?.categories ?? [])

const filters = reactive<ProductFilters>({
  categoryId: "",
  minPrice: undefined,
  maxPrice: undefined
})

const emit = defineEmits<{
  (e: 'filter', filters: ProductFilters): void
}>()

const emitFilters = (): void => {
  const activeFilters: ProductFilters = {}
  
  if (filters.categoryId) activeFilters.categoryId = filters.categoryId
  if (filters.minPrice) activeFilters.minPrice = filters.minPrice
  if (filters.maxPrice) activeFilters.maxPrice = filters.maxPrice
  
  emit('filter', activeFilters)
}

const clearFilters = (): void => {
  filters.categoryId = ""
  filters.minPrice = undefined
  filters.maxPrice = undefined
  emitFilters()
}

defineExpose({ filters })
</script>
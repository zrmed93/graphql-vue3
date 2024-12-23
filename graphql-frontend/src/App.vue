<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Product Catalog</h1>
    
    <RoleSwitcher ref="roleSwitcher" />
    <SearchBar :onSearch="handleSearch" />
    <Filters @filter="handleFilter" />
    
    <div v-if="loading" class="text-center py-4">
      Loading...
    </div>
    
    <div v-else-if="error" class="text-red-600 py-4">
      {{ error.message }}
    </div>
    
    <ProductList
      v-else
      :products="products"
      :isAdmin="!!(roleSwitcher?.isAdmin)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { PRODUCTS_QUERY } from './graphql/queries'
import SearchBar from './components/SearchBar.vue'
import Filters from './components/Filters.vue'
import ProductList from './components/ProductList.vue'
import RoleSwitcher from './components/RoleSwitcher.vue'
import { Product, ProductFilters } from './types'
//import { Product } from './types'

interface QueryVariables {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}

const roleSwitcher = ref<InstanceType<typeof RoleSwitcher> | null>(null)
const searchTerm = ref('')
const filters = ref<ProductFilters>({})

const variables = computed<QueryVariables>(() => ({
  search: searchTerm.value || undefined,
  ...filters.value
}))

const { result, loading, error } = useQuery<{ products: Product[] }>(
  PRODUCTS_QUERY,
  variables
)

const products = computed(() => result.value?.products ?? [])

const handleSearch = (term: string): void => {
  searchTerm.value = term
}

const handleFilter = (newFilters: ProductFilters): void => {
  filters.value = newFilters
}
</script>

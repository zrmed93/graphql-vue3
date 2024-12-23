<template>
  <div class="mb-4 flex items-center space-x-2">
    <span class="text-gray-700">Role:</span>
    <button 
      @click="toggleRole"
      :class="[
        'px-4 py-2 rounded-lg',
        isAdmin 
          ? 'bg-red-600 text-white hover:bg-red-700' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      ]"
    >
      {{ isAdmin ? 'Admin' : 'User' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useApolloClient } from '@vue/apollo-composable'
import { currentRole, updateApolloLink } from '../apollo'
import { UserRole } from '../types'
import { PRODUCTS_QUERY, CATEGORIES_QUERY } from '../graphql/queries'

const apolloClient = useApolloClient()
const isAdmin = ref(false)

const toggleRole = async (): Promise<void> => {
  isAdmin.value = !isAdmin.value
  currentRole.value = isAdmin.value ? 'admin' : 'user'
  
  // Update Apollo client's link with new role
  updateApolloLink()
  
  // Refetch specific queries instead of reloading the page
  await Promise.all([
    apolloClient.client.refetchQueries({
      include: [PRODUCTS_QUERY, CATEGORIES_QUERY]
    })
  ])
}

defineExpose({ isAdmin })
</script>
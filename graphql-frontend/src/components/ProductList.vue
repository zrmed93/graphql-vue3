<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div
      v-for="product in products"
      :key="product.id"
      class="p-4 border rounded-lg shadow-sm"
    >
      <div class="flex justify-between items-start">
        <div>
          <div v-if="isEditing === product.id">
            <input
              v-model="editName"
              class="border rounded px-2 py-1"
              @keyup.enter="handleUpdate(product.id)"
            />
            <div class="mt-1 flex space-x-2">
              <button
                @click="handleUpdate(product.id)"
                class="text-sm text-green-600 hover:text-green-800"
              >
                Save
              </button>
              <button
                @click="cancelEdit"
                class="text-sm text-red-600 hover:text-red-800"
              >
                Cancel
              </button>
            </div>
          </div>
          <template v-else>
            <h3 class="text-lg font-semibold">{{ product.name }}</h3>
            <button
              v-if="isAdmin"
              @click="startEdit(product)"
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </template>
        </div>
        <p class="text-lg font-medium">
          ${{ formatPrice(product.price) }}
        </p>
      </div>
      <p class="text-gray-600 mt-2">
        Category: {{ product.category.name }}
      </p>
      <p v-if="error" class="text-red-600 mt-2 text-sm">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import { UPDATE_PRODUCT_NAME } from '../graphql/queries'
import { Product } from '../types'
interface Props {
  products: Product[];
  isAdmin: boolean;
}

const props = defineProps<Props>()
const isEditing = ref<string | null>(null)
const editName = ref('')
const error = ref('')

const { mutate: updateProduct } = useMutation(UPDATE_PRODUCT_NAME)

const formatPrice = (price: number): string | number => {
  return props.isAdmin ? price.toFixed(2) : Math.round(price)
}

const startEdit = (product: Product): void => {
  isEditing.value = product.id
  editName.value = product.name
}

const cancelEdit = (): void => {
  isEditing.value = null
  editName.value = ''
  error.value = ''
}

const handleUpdate = async (productId: string): Promise<void> => {
  if (!productId || !editName.value) {
    error.value = 'Product ID and name are required'
    return
  }

  try {
    await updateProduct({
      id: productId,
      name: editName.value.trim()
    })
    cancelEdit()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred'
  }
}
</script>
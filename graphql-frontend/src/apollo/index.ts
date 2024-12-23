import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { UserRole } from '../types'
import { ref } from 'vue'

// Create a reactive reference to track the current role
export const currentRole = ref<UserRole>('user')

// Create a function to get the HTTP link with current role
const getHttpLink = () => createHttpLink({
  uri: 'http://localhost:4000/graphql',
  headers: {
    Authorization: `Bearer ${currentRole.value}`
  }
})

export const apolloClient = new ApolloClient({
  link: getHttpLink(),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only'
    }
  }
})

// Add a function to update the client's link
export const updateApolloLink = () => {
  apolloClient.setLink(getHttpLink())
}
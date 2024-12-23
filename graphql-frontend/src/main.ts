import { createApp, provide, h } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { apolloClient } from './apollo'
import App from './App.vue'
import './style.css'

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
    return () => h(App)
  }
})

app.mount('#app') 
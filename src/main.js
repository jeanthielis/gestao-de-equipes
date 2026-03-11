import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router' // O arquivo de rotas que criamos
import './style.css' // Onde o Tailwind está configurado
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// A ordem importa! Primeiro você "liga" as ferramentas...
app.use(pinia)
app.use(router)

// ... e só depois você "monta" o aplicativo na tela.
app.mount('#app')
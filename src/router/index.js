import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Portafolio from '../views/Portafolio.vue'
import Contacto from '../views/Contacto.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/portafolio', component: Portafolio },
  { path: '/contacto', component: Contacto }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

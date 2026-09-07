import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Portafolio from '../views/Portafolio.vue'
import Contacto from '../views/Contacto.vue'

const routes = [
  { path: '/', component: Home, meta: { title: 'polett villarroel — arquitecta' } },
  { path: '/portafolio', component: Portafolio, meta: { title: 'portafolio — polett villarroel' } },
  { path: '/contacto', component: Contacto, meta: { title: 'contacto — polett villarroel' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  document.title = to.meta.title || 'Polett Villarroel'
})

export default router
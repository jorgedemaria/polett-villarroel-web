import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Portafolio from '../views/Portafolio.vue'
import Contacto from '../views/Contacto.vue'

const routes = [
  {
    path: '/',
    component: Home,
    meta: {
      title: 'polett villarroel — arquitecta',
      description: 'Portafolio de Polett Villarroel, arquitecta especializada en arquitectura, patrimonio y territorio.'
    }
  },
  {
    path: '/portafolio',
    component: Portafolio,
    meta: {
      title: 'portafolio — polett villarroel',
      description: 'Proyectos de arquitectura, rehabilitación y patrimonio de Polett Villarroel.'
    }
  },
  {
    path: '/contacto',
    component: Contacto,
    meta: {
      title: 'contacto — polett villarroel',
      description: 'Contacto profesional de Polett Villarroel, arquitecta.'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  document.title = to.meta.title || 'Polett Villarroel'
  const description = document.querySelector('meta[name="description"]')

  if (description && to.meta.description) {
    description.setAttribute('content', to.meta.description)
  }
})

export default router
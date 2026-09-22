import { createRouter, createWebHistory } from 'vue-router'
import AppSobre from './components/AppSobre.vue'
import AppCardapio from './components/AppCardapio.vue'
import AppGaleria from './components/AppGaleria.vue'
import AppFeedback from './components/AppFeedback.vue'
import AppReserva from './components/AppReserva.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: AppSobre },
    { path: '/cardapio', component: AppCardapio },
    { path: '/galeria', component: AppGaleria },
    { path: '/feedback', component: AppFeedback },
    { path: '/reservas', component: AppReserva },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import SheetsView from './views/SheetsView.vue'
import SheetsDataView from './views/SheetsDataView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/sheets',
      name: 'sheets',
      component: SheetsView,
      meta: {
        sheetsDataStatus: 'idle'
      }
    },
    {
      path: '/sheets/data',
      name: 'data',
      component: SheetsDataView,
      beforeEnter: (to, from, next) => {
        if (from.meta.sheetsDataStatus === 'success') {
          next();
        } else {
          next({ name: 'sheets' });
        }
      },
    },
  ]
})

export default router

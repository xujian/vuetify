import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [{
    path: '/',
    name: 'home',
    component: () =>
      import ('@/pages/home')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import ('@/pages/dashboard/layout'),
    children: [{
        path: 'indicators',
        name: 'dashboard.indicators',
        component: () => import ('@/pages/dashboard/indicators')
      },
      {
        path: 'backup',
        name: 'dashboard.backup',
        component: () => import ('@/pages/dashboard/backup')
      },
      {
        path: 'logs',
        name: 'dashboard.logs',
        component: () => import ('@/pages/dashboard/logs')
      }
    ]
  }
]

export default new VueRouter({
  mode: 'history',
  routes
})

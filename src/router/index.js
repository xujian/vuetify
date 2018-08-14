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
        path: 'calls',
        name: 'dashboard.calls',
        component: () => import ('@/pages/dashboard/calls')
      },
      {
        path: 'conversions',
        name: 'dashboard.conversions',
        component: () => import ('@/pages/dashboard/conversions')
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

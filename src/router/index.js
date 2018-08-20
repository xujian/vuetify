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
    path: '/analytics',
    name: 'analytics',
    component: () => import ('@/pages/analytics/layout'),
    children: [{
        path: 'calls',
        name: 'analytics.calls',
        component: () => import ('@/pages/analytics/calls')
      },
      {
        path: 'conversions',
        name: 'analytics.conversions',
        component: () => import ('@/pages/analytics/conversions')
      },
      {
        path: 'logs',
        name: 'analytics.logs',
        component: () => import ('@/pages/analytics/logs')
      }
    ]
  }
]

export default new VueRouter({
  mode: 'history',
  routes
})

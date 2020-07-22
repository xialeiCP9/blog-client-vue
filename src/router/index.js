import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default function createRouter () {
  return new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: () => import(/* webpackChunkName:'HelloWorld' */ '@/components/HelloWorld'),
        name: 'HelloWorld'
      },
      {
        path: '/about',
        component: () => import(/* webpackChunkName:'About' */ '@/components/About'),
        name: 'About'
      }
    ]
  })
}
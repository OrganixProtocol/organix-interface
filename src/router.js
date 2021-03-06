import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Overview from './views/Overview.vue'
import Me from './views/Me.vue'
import Store from './views/Store.vue'
import Exchange from './views/Exchange.vue'

Vue.use(Router)

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/exchange',
      name: 'exchange',
      component: Exchange
    },
    {
      path: '/overview',
      name: 'overview',
      component: Overview
    },
    {
      path: '/store',
      name: 'store',
      component: Store
    },
    {
      path: '/me',
      name: 'me',
      component: Me
    }
  ]
})

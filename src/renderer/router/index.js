import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/TestPage',
      name: "test-page",
      component: () => import('../views/test-page')
    },
    {
      path: '/',
      name: "loading-page",
      component: () => import('../views/loading-page')
    },
    {
      path: '/InitPage',
      name: "init-page",
      component: () => import('../views/init-page')
      // component: () => import('../views/InitPage.vue')
    },
    {
      path: '/MainPage',
      name: 'main-page',
      component: () => import('../views/main-page')
      // component: require('@/components/LandingPage').default
      // component: () => import('../views/MainPage.vue')
    },
    {
      path: '/MainPage/History',
      name: "tree-history",
      component: () => import('../views/main-page/components/TreePage/History')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginPage from "../views/LoginPage.vue"
import TwitterAccount from "../views/HomeView/TwitterAccount.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: "/home",
      name: 'home',
      component: HomeView,
      children: [
        {
          path: 'create-twitter-account',
          name: 'create-twitter-account',
          component: () => import('../views/HomeView/CreateTwitterAccount.vue')
        },
        {
          path: 'account/:user_id',
          name: "account",
          component: TwitterAccount
        }
      ]
    },
  ]
})


export default router

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginPage from "../views/LoginPage.vue"
import TwitterAccount from "../views/HomeView/TwitterAccount.vue"
import PageNotFound from "../views/PageNotFound.vue"
import { useUserStore } from "@/stores/users.store"
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: "/login",
    },
    {
      path: '/login',
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
        },
        {
          path: 'boost-likes',
          name: "boost-likes",
          component: () => import('../views/HomeView/BoostLikes.vue')
        },
        {
          path: 'boost-retweet',
          name: "boost-retweet",
          component: () => import('../views/HomeView/BoostReTweet.vue')
        },
        {
          path: 'boost-quote-tweet',
          name: "boost-quote-tweet",
          component: () => import('../views/HomeView/BoostQuoteTweet.vue')
        },
      ]
    }, { path: "/:catchAll(.*)", component: PageNotFound }]
})

router.beforeEach(async (to) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ["/login"];
  const authRequired = !publicPages.includes(to.path);
  const user_store = useUserStore()
  console.log(to.path, authRequired, user_store.$state.user);

  if (authRequired && !user_store.$state.user) {
    return "/login";
  } else if (to.path == "/login" && user_store.$state.user) {
    return "/home";
  }

})

export default router

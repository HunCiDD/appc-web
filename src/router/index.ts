import {createRouter, createWebHistory} from 'vue-router'
import {useTokenStore} from '@/apps/appc_auth/stores/token'

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: {requiresAuth: true},
    children: [
      {
        path: '/auth/admin/users',
        name: 'user-admin',
        component: () => import('@/apps/appc_auth/views/UserAdmin.vue'),
      },
      {
        path: '/auth/admin/roles',
        name: 'role-admin',
        component: () => import('@/apps/appc_auth/views/RoleAdmin.vue'),
      },
      {
        path: '/auth/admin/resource',
        name: 'resource-admin',
        component: () => import('@/apps/appc_auth/views/ResourceAdmin.vue'),
      },
      {
        path: '/daily-tracker/time-spend',
        name: 'time-spend',
        component: () => import('@/apps/appx_tracker/views/TimeSpend.vue'),
      },
      {
        path: '/daily-tracker/action/data',
        name: 'action-data',
        component: () => import('@/apps/appx_tracker/views/ActionData.vue'),
      },
      {
        path: '/daily-tracker/thing/data',
        name: 'thing-data',
        component: () => import('@/apps/appx_tracker/views/ThingData.vue'),
      },
      {
        path: '/daily-tracker/tag/data',
        name: 'tag-data',
        component: () => import('@/apps/appx_tracker/views/TagData.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/apps/appc_auth/views/Login.vue'),
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('@/views/About.vue'),
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('@/views/Test.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const tokenStore = useTokenStore()
  if (to.matched.some((record) => record.meta?.requiresAuth)) {
    const isAuthenticated = tokenStore.isAuthenticated
    // 需要认证的路由
    if (!isAuthenticated) {
      // 未认证，重定向到登录页面
      next({name: 'login', query: {redirect: to.fullPath}})
      return
    }
  }
  next() // 确保一定要调用 next()
})

export default router

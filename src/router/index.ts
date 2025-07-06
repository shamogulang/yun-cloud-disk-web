import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        meta:{"menuname":"首页"},
        component: () => import('../views/Home.vue')
      },
      {
        path: '/transfer',
        name: 'TransferList',
        meta:{"menuname":"传输列表"},
        component: () => import('../views/TransferList.vue')
      },
      {
        path: '/statistic',
        name: 'Statistics',
        meta:{"menuname":"统计"},
        component: () => import('../views/Statistic.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/shared/:linkId',
    name: 'Shared',
    component: () => import('../views/Shared.vue')
  },
  {
    path: '/share-cancelled',
    name: 'ShareCancelled',
    component: () => import('../views/ShareCancelled.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem('token')
//   if (to.path !== '/login' && !token) {
//     next('/login')
//   } else {
//     next()
//   }
// })

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  // 放行 /shared/ 路径
  
  if (to.path.startsWith('/shared/')) {
    console.log(to.path)
    next()
    return
  }
  if (to.path !== '/login' && to.path !== '/register' && !token) {
    next('/login')
  } else {
    next()
  }
})


export default router 
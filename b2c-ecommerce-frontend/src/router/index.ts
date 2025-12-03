import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/Register.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/user/Profile.vue'),
      meta: { requiresAuth: true }
    },
    // 系统管理（使用嵌套路由和布局）
    {
      path: '/system',
      name: 'system',
      component: () => import('@/views/system/SystemLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/system/users'
        },
        {
          path: 'users',
          name: 'system.users',
          component: () => import('@/views/system/UserManagement.vue'),
          meta: { requiresAuth: true, title: '用户管理' }
        },
        {
          path: 'roles',
          name: 'system.roles',
          component: () => import('@/views/system/RoleManagement.vue'),
          meta: { requiresAuth: true, title: '角色管理' }
        },
        {
          path: 'permissions',
          name: 'system.permissions',
          component: () => import('@/views/system/PermissionManagement.vue'),
          meta: { requiresAuth: true, title: '权限管理' }
        },
        // 商品管理模块
        {
          path: 'products',
          name: 'system.products',
          component: () => import('@/views/system/products/ProductList.vue'),
          meta: { requiresAuth: true, title: '商品管理' }
        },
        {
          path: 'products/add',
          name: 'system.products.add',
          component: () => import('@/views/system/products/ProductForm.vue'),
          meta: { requiresAuth: true, title: '添加商品' }
        },
        {
          path: 'products/edit/:id',
          name: 'system.products.edit',
          component: () => import('@/views/system/products/ProductForm.vue'),
          meta: { requiresAuth: true, title: '编辑商品' }
        },
        {
          path: 'categories',
          name: 'system.categories',
          component: () => import('@/views/system/products/CategoryManagement.vue'),
          meta: { requiresAuth: true, title: '商品分类' }
        },
        {
          path: 'product-reviews',
          name: 'system.product-reviews',
          component: () => import('@/views/system/products/ProductReviewManagement.vue'),
          meta: { requiresAuth: true, title: '商品评价' }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
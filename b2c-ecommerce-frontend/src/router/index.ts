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
        },
        // 订单管理模块
        {
          path: 'orders',
          name: 'system.orders',
          component: () => import('@/views/system/orders/OrderManagement.vue'),
          meta: { requiresAuth: true, title: '订单管理' }
        },
        {
          path: 'orders/detail/:id',
          name: 'system.orders.detail',
          component: () => import('@/views/system/orders/OrderDetail.vue'),
          meta: { requiresAuth: true, title: '订单详情' }
        },
        {
          path: 'refunds',
          name: 'system.refunds',
          component: () => import('@/views/system/orders/RefundManagement.vue'),
          meta: { requiresAuth: true, title: '退款管理' }
        },
        {
          path: 'after-sales',
          name: 'system.after-sales',
          component: () => import('@/views/system/orders/AfterSaleManagement.vue'),
          meta: { requiresAuth: true, title: '售后服务' }
        },
        {
          path: 'order-statistics',
          name: 'system.order-statistics',
          component: () => import('@/views/system/orders/OrderStatistics.vue'),
          meta: { requiresAuth: true, title: '订单统计' }
        },
        // 支付管理模块
        {
          path: 'payment-channels',
          name: 'system.payment-channels',
          component: () => import('@/views/system/payments/PaymentChannelManagement.vue'),
          meta: { requiresAuth: true, title: '支付渠道管理' }
        },
        {
          path: 'payment-security',
          name: 'system.payment-security',
          component: () => import('@/views/system/payments/PaymentSecurityManagement.vue'),
          meta: { requiresAuth: true, title: '支付安全管理' }
        },
        {
          path: 'payment-refunds',
          name: 'system.payment-refunds',
          component: () => import('@/views/system/payments/RefundManagement.vue'),
          meta: { requiresAuth: true, title: '退款处理' }
        },
        {
          path: 'reconciliation',
          name: 'system.reconciliation',
          component: () => import('@/views/system/payments/ReconciliationManagement.vue'),
          meta: { requiresAuth: true, title: '对账系统' }
        },
        {
          path: 'payment-statistics',
          name: 'system.payment-statistics',
          component: () => import('@/views/system/payments/PaymentStatistics.vue'),
          meta: { requiresAuth: true, title: '支付统计分析' }
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
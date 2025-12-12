import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/login'
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
          path: 'products/view/:id',
          name: 'system.products.view',
          component: () => import('@/views/system/products/ProductDetail.vue'),
          meta: { requiresAuth: true, title: '查看商品详情' }
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
        },
        // 库存管理模块
        {
          path: 'inventory',
          name: 'system.inventory',
          component: () => import('@/views/system/inventory/InventoryList.vue'),
          meta: { requiresAuth: true, title: '库存管理' }
        },
        {
          path: 'inventory/detail/:id',
          name: 'system.inventory.detail',
          component: () => import('@/views/system/inventory/InventoryDetail.vue'),
          meta: { requiresAuth: true, title: '库存详情' }
        },
        {
          path: 'inventory/alert',
          name: 'system.inventory.alert',
          component: () => import('@/views/system/inventory/InventoryAlert.vue'),
          meta: { requiresAuth: true, title: '库存预警' }
        },
        {
          path: 'inventory/adjust',
          name: 'system.inventory.adjust',
          component: () => import('@/views/system/inventory/InventoryAdjust.vue'),
          meta: { requiresAuth: true, title: '库存调整' }
        },
        {
          path: 'inventory/analysis',
          name: 'system.inventory.analysis',
          component: () => import('@/views/system/inventory/InventoryAnalysis.vue'),
          meta: { requiresAuth: true, title: '库存分析' }
        },
        // 营销管理模块
        {
          path: 'promotions',
          name: 'system.promotions',
          component: () => import('@/views/system/marketing/PromotionList.vue'),
          meta: { requiresAuth: true, title: '促销活动' }
        },
        {
          path: 'promotions/create',
          name: 'system.promotions.create',
          component: () => import('@/views/system/marketing/PromotionForm.vue'),
          meta: { requiresAuth: true, title: '创建促销活动' }
        },
        {
          path: 'promotions/edit/:id',
          name: 'system.promotions.edit',
          component: () => import('@/views/system/marketing/PromotionForm.vue'),
          meta: { requiresAuth: true, title: '编辑促销活动' }
        },
        {
          path: 'coupons',
          name: 'system.coupons',
          component: () => import('@/views/system/marketing/CouponList.vue'),
          meta: { requiresAuth: true, title: '优惠券管理' }
        },
        {
          path: 'coupons/create',
          name: 'system.coupons.create',
          component: () => import('@/views/system/marketing/CouponForm.vue'),
          meta: { requiresAuth: true, title: '创建优惠券' }
        },
        {
          path: 'seckill',
          name: 'system.seckill',
          component: () => import('@/views/system/marketing/SeckillList.vue'),
          meta: { requiresAuth: true, title: '秒杀活动' }
        },
        {
          path: 'seckill/create',
          name: 'system.seckill.create',
          component: () => import('@/views/system/marketing/SeckillForm.vue'),
          meta: { requiresAuth: true, title: '创建秒杀活动' }
        },
        {
          path: 'group-buying',
          name: 'system.group-buying',
          component: () => import('@/views/system/marketing/GroupBuyingList.vue'),
          meta: { requiresAuth: true, title: '团购活动' }
        },
        {
          path: 'group-buying/create',
          name: 'system.group-buying.create',
          component: () => import('@/views/system/marketing/GroupBuyingForm.vue'),
          meta: { requiresAuth: true, title: '创建团购活动' }
        },
        {
          path: 'group-buying/:id',
          name: 'system.group-buying.detail',
          component: () => import('@/views/system/marketing/GroupBuyingDetail.vue'),
          meta: { requiresAuth: true, title: '团购活动详情' }
        },
        {
          path: 'group-buying/:id/groups',
          name: 'system.group-buying.groups',
          component: () => import('@/views/system/marketing/GroupBuyingGroupList.vue'),
          meta: { requiresAuth: true, title: '团购列表' }
        },
        {
          path: 'group-buying/:id/groups/:groupId/orders',
          name: 'system.group-buying.orders',
          component: () => import('@/views/system/marketing/GroupBuyingOrderList.vue'),
          meta: { requiresAuth: true, title: '团购订单' }
        },
        {
          path: 'marketing-analysis',
          name: 'system.marketing-analysis',
          component: () => import('@/views/system/marketing/MarketingAnalysis.vue'),
          meta: { requiresAuth: true, title: '营销数据分析' }
        },
        // 消息通知模块
        {
          path: 'message-templates',
          name: 'system.message-templates',
          component: () => import('@/views/system/message/MessageTemplateList.vue'),
          meta: { requiresAuth: true, title: '消息模板' }
        },
        {
          path: 'message-templates/create',
          name: 'system.message-templates.create',
          component: () => import('@/views/system/message/MessageTemplateForm.vue'),
          meta: { requiresAuth: true, title: '创建消息模板' }
        },
        {
          path: 'message-templates/edit/:id',
          name: 'system.message-templates.edit',
          component: () => import('@/views/system/message/MessageTemplateForm.vue'),
          meta: { requiresAuth: true, title: '编辑消息模板' }
        },
        {
          path: 'message-send',
          name: 'system.message-send',
          component: () => import('@/views/system/message/MessageSend.vue'),
          meta: { requiresAuth: true, title: '发送消息' }
        },
        {
          path: 'message-records',
          name: 'system.message-records',
          component: () => import('@/views/system/message/MessageRecords.vue'),
          meta: { requiresAuth: true, title: '发送记录' }
        },
        {
          path: 'notification-rules',
          name: 'system.notification-rules',
          component: () => import('@/views/system/message/NotificationRules.vue'),
          meta: { requiresAuth: true, title: '通知规则' }
        },
        {
          path: 'notification-rules/create',
          name: 'system.notification-rules.create',
          component: () => import('@/views/system/message/NotificationRuleForm.vue'),
          meta: { requiresAuth: true, title: '创建通知规则' }
        },
        {
          path: 'notification-rules/edit/:id',
          name: 'system.notification-rules.edit',
          component: () => import('@/views/system/message/NotificationRuleForm.vue'),
          meta: { requiresAuth: true, title: '编辑通知规则' }
        },
        {
          path: 'message-statistics',
          name: 'system.message-statistics',
          component: () => import('@/views/system/message/MessageStatistics.vue'),
          meta: { requiresAuth: true, title: '消息统计' }
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
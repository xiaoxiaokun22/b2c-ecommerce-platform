<template>
  <div class="system-layout">
    <el-container>
      <!-- 侧边菜单 -->
      <el-aside width="200px">
        <div class="system-header">
          <h2>系统管理</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="system-menu"
          router
          unique-opened
        >
          <el-menu-item index="/system/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/system/roles">
            <el-icon><UserFilled /></el-icon>
            <span>角色管理</span>
          </el-menu-item>
          <el-menu-item index="/system/permissions">
            <el-icon><Lock /></el-icon>
            <span>权限管理</span>
          </el-menu-item>

          <!-- 商品管理模块 -->
          <el-sub-menu index="products">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>商品管理</span>
            </template>
            <el-menu-item index="/system/products">
              <el-icon><List /></el-icon>
              <span>商品列表</span>
            </el-menu-item>
            <el-menu-item index="/system/categories">
              <el-icon><Files /></el-icon>
              <span>商品分类</span>
            </el-menu-item>
            <el-menu-item index="/system/product-reviews">
              <el-icon><ChatDotRound /></el-icon>
              <span>商品评价</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 订单管理 -->
          <el-sub-menu index="orders">
            <template #title>
              <el-icon><ShoppingCart /></el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/system/orders">
              <el-icon><List /></el-icon>
              <span>订单列表</span>
            </el-menu-item>
            <el-menu-item index="/system/refunds">
              <el-icon><Money /></el-icon>
              <span>退款管理</span>
            </el-menu-item>
            <el-menu-item index="/system/after-sales">
              <el-icon><Service /></el-icon>
              <span>售后服务</span>
            </el-menu-item>
            <el-menu-item index="/system/order-statistics">
              <el-icon><TrendCharts /></el-icon>
              <span>订单统计</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 支付管理 -->
          <el-sub-menu index="payments">
            <template #title>
              <el-icon><CreditCard /></el-icon>
              <span>支付管理</span>
            </template>
            <el-menu-item index="/system/payment-channels">
              <el-icon><Wallet /></el-icon>
              <span>支付渠道</span>
            </el-menu-item>
            <el-menu-item index="/system/payment-security">
              <el-icon><Key /></el-icon>
              <span>支付安全</span>
            </el-menu-item>
            <el-menu-item index="/system/payment-refunds">
              <el-icon><RefreshLeft /></el-icon>
              <span>退款处理</span>
            </el-menu-item>
            <el-menu-item index="/system/reconciliation">
              <el-icon><ScaleToOriginal /></el-icon>
              <span>对账系统</span>
            </el-menu-item>
            <el-menu-item index="/system/payment-statistics">
              <el-icon><DataAnalysis /></el-icon>
              <span>支付统计</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 库存管理 -->
          <el-sub-menu index="inventory">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>库存管理</span>
            </template>
            <el-menu-item index="/system/inventory">
              <el-icon><List /></el-icon>
              <span>库存列表</span>
            </el-menu-item>
            <el-menu-item index="/system/inventory/alert">
              <el-icon><Warning /></el-icon>
              <span>库存预警</span>
            </el-menu-item>
            <el-menu-item index="/system/inventory/adjust">
              <el-icon><EditPen /></el-icon>
              <span>库存调整</span>
            </el-menu-item>
            <el-menu-item index="/system/inventory/analysis">
              <el-icon><TrendCharts /></el-icon>
              <span>库存分析</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 营销管理 -->
          <el-sub-menu index="marketing">
            <template #title>
              <el-icon><Present /></el-icon>
              <span>营销管理</span>
            </template>
            <el-menu-item index="/system/promotions">
              <el-icon><Promotion /></el-icon>
              <span>促销活动</span>
            </el-menu-item>
            <el-menu-item index="/system/coupons">
              <el-icon><Ticket /></el-icon>
              <span>优惠券</span>
            </el-menu-item>
            <el-menu-item index="/system/seckill">
              <el-icon><Timer /></el-icon>
              <span>秒杀活动</span>
            </el-menu-item>
            <el-menu-item index="/system/group-buying">
              <el-icon><UserFilled /></el-icon>
              <span>团购活动</span>
            </el-menu-item>
            <el-menu-item index="/system/marketing-analysis">
              <el-icon><DataAnalysis /></el-icon>
              <span>营销分析</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 消息通知 -->
          <el-sub-menu index="message">
            <template #title>
              <el-icon><Bell /></el-icon>
              <span>消息通知</span>
            </template>
            <el-menu-item index="/system/message-templates">
              <el-icon><Document /></el-icon>
              <span>消息模板</span>
            </el-menu-item>
            <el-menu-item index="/system/message-send">
              <el-icon><Message /></el-icon>
              <span>发送消息</span>
            </el-menu-item>
            <el-menu-item index="/system/message-records">
              <el-icon><List /></el-icon>
              <span>发送记录</span>
            </el-menu-item>
            <el-menu-item index="/system/notification-rules">
              <el-icon><Setting /></el-icon>
              <span>通知规则</span>
            </el-menu-item>
            <el-menu-item index="/system/message-statistics">
              <el-icon><DataAnalysis /></el-icon>
              <span>消息统计</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!-- 主内容区域 -->
      <el-container>
        <!-- 顶部导航 -->
        <el-header height="60px">
          <div class="header-content">
            <div class="breadcrumb">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item>系统管理</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="user-info">
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                  {{ userStore.user?.nickname || '用户' }}
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                    <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <!-- 主要内容 -->
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  User, UserFilled, Lock, ArrowDown, Goods, List, Files, ChatDotRound,
  ShoppingCart, Money, Service, TrendCharts, CreditCard, Wallet, Key,
  RefreshLeft, ScaleToOriginal, DataAnalysis, Box, Warning, EditPen,
  Present, Promotion, Ticket, Timer, Bell, Document, Setting, Message
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 当前激活的菜单
const activeMenu = ref('')

// 当前页面标题
const currentPageTitle = computed(() => {
  return route.meta?.title as string || '系统管理'
})

// 监听路由变化更新激活菜单
watch(
  () => route.path,
  (newPath) => {
    if (newPath.startsWith('/system')) {
      activeMenu.value = newPath
    }
  },
  { immediate: true }
)

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

// 初始化
onMounted(() => {
  // 初始化用户信息
  userStore.initUserInfo()

  // 如果用户未登录，跳转到登录页
  if (!userStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>

<style scoped>
.system-layout {
  height: 100vh;
}

.system-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #304156;
  color: white;
  border-bottom: 1px solid #1a2533;
}

.system-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px;
}

.system-menu {
  border-right: none;
  background-color: #304156;
}

/* 顶级菜单项样式 */
.system-menu .el-menu-item {
  color: #ff9800 !important;
  border-bottom: 1px solid #1a2533;
  background-color: transparent !important;
}

.system-menu .el-menu-item:hover {
  background-color: #263445 !important;
  color: #ff9800 !important;
}

.system-menu .el-menu-item.is-active {
  background-color: #ff9800 !important;
  color: white !important;
}

/* 子菜单标题样式 */
.system-menu .el-sub-menu__title {
  color: #ff9800 !important;
  border-bottom: 1px solid #1a2533;
  background-color: transparent !important;
}

.system-menu .el-sub-menu__title:hover {
  background-color: #263445 !important;
  color: #ff9800 !important;
}

.system-menu .el-sub-menu.is-opened .el-sub-menu__title {
  color: #ff9800 !important;
}

/* 子菜单项样式 - 使用更强的选择器确保样式生效 */
.system-menu .el-sub-menu .el-menu-item {
  padding-left: 45px !important;
  font-size: 14px !important;
  color: #bfcbd9 !important;
  background-color: transparent !important;
}

.system-menu .el-sub-menu .el-menu-item:hover {
  background-color: #263445 !important;
  color: white !important;
}

.system-menu .el-sub-menu .el-menu-item.is-active {
  background-color: #409eff !important;
  color: white !important;
}

/* 图标样式统一 */
.system-menu .el-menu-item .el-icon,
.system-menu .el-sub-menu__title .el-icon,
.system-menu .el-sub-menu .el-menu-item .el-icon {
  margin-right: 6px;
  font-size: 16px;
}

/* 文字样式统一 */
.system-menu .el-menu-item span,
.system-menu .el-sub-menu__title span,
.system-menu .el-sub-menu .el-menu-item span {
  font-size: 14px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 16px;
  background-color: white;
  border-bottom: 1px solid #dcdfe6;
}

.breadcrumb {
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}

.el-dropdown-link:hover {
  color: #409eff;
}

.el-icon--right {
  margin-left: 5px;
}

.el-main {
  background-color: #f0f2f5;
  padding: 0;
}
</style>
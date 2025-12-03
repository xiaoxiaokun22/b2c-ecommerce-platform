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
import { User, UserFilled, Lock, ArrowDown, Goods, List, Files, ChatDotRound } from '@element-plus/icons-vue'

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

.system-menu .el-menu-item {
  color: #bfcbd9;
  border-bottom: 1px solid #1a2533;
}

.system-menu .el-menu-item:hover {
  background-color: #263445;
  color: white;
}

.system-menu .el-menu-item.is-active {
  background-color: #409eff;
  color: white;
}

.system-menu .el-menu-item .el-icon {
  margin-right: 6px;
  font-size: 16px;
}

.system-menu .el-menu-item span {
  font-size: 14px;
}

.system-menu .el-sub-menu__title .el-icon {
  margin-right: 6px;
  font-size: 16px;
}

.system-menu .el-sub-menu__title span {
  font-size: 14px;
}

.system-menu .el-sub-menu .el-menu-item {
  padding-left: 45px !important;
  font-size: 13px;
}

.system-menu .el-sub-menu .el-menu-item .el-icon {
  margin-right: 4px;
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
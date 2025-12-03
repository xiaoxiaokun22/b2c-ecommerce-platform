<template>
  <div class="home-container">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="nav-left">
          <h1>B2C电商平台</h1>
        </div>
        <div class="nav-right">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown @command="handleDropdown">
              <span class="user-dropdown">
                <el-avatar :size="32" :src="userStore.user?.avatar">
                  {{ userStore.user?.nickname?.charAt(0) || 'U' }}
                </el-avatar>
                <span class="username">{{ userStore.user?.nickname || '用户' }}</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="system">系统管理</el-dropdown-item>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" @click="$router.push('/login')">登录</el-button>
            <el-button @click="$router.push('/register')">注册</el-button>
          </template>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="main-content">
      <div class="hero-section">
        <div class="hero-content">
          <h2>欢迎来到B2C电商平台</h2>
          <p>为您提供优质的购物体验</p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="browseProducts">
              开始购物
            </el-button>
            <el-button v-if="userStore.isLoggedIn" type="success" size="large" @click="goToSystem">
              <el-icon><Setting /></el-icon>
              系统管理
            </el-button>
            <el-button size="large" @click="learnMore">
              了解更多
            </el-button>
          </div>
        </div>
      </div>

      <div class="features-section">
        <div class="features-grid">
          <div class="feature-card">
            <el-icon size="48" color="#409eff"><user /></el-icon>
            <h3>用户管理</h3>
            <p>完善的用户体系，支持多种登录方式，安全可靠</p>
          </div>
          <div class="feature-card">
            <el-icon size="48" color="#67c23a"><shopping-cart /></el-icon>
            <h3>商品管理</h3>
            <p>丰富的商品分类，智能搜索推荐，购物车功能</p>
          </div>
          <div class="feature-card">
            <el-icon size="48" color="#e6a23c"><credit-card /></el-icon>
            <h3>安全支付</h3>
            <p>多种支付方式，交易安全有保障</p>
          </div>
          <div class="feature-card">
            <el-icon size="48" color="#f56c6c"><van /></el-icon>
            <h3>物流配送</h3>
            <p>智能物流系统，快速配送上门</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { ArrowDown, User, ShoppingCart, CreditCard, Van, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 处理下拉菜单命令
const handleDropdown = (command: string) => {
  switch (command) {
    case 'system':
      router.push('/system')
      break
    case 'profile':
      router.push('/profile')
      break
    case 'orders':
      ElMessage.info('订单功能开发中...')
      break
    case 'logout':
      userStore.logout()
      break
  }
}

// 浏览商品
const browseProducts = () => {
  ElMessage.info('商品页面开发中...')
}

// 了解更多
const learnMore = () => {
  ElMessage.info('关于我们页面开发中...')
}

// 进入系统管理
const goToSystem = () => {
  router.push('/system')
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.navbar {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.nav-left h1 {
  margin: 0;
  color: #409eff;
  font-size: 24px;
  font-weight: 700;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #606266;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin: 40px 0;
  padding: 80px 40px;
  text-align: center;
  color: white;
}

.hero-content h2 {
  font-size: 48px;
  margin-bottom: 20px;
  font-weight: 700;
}

.hero-content p {
  font-size: 20px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.hero-actions .el-button {
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 25px;
}

.features-section {
  margin: 60px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.feature-card h3 {
  margin: 20px 0 15px;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.feature-card p {
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

@media (max-width: 768px) {
  .nav-content {
    padding: 0 15px;
  }

  .nav-left h1 {
    font-size: 20px;
  }

  .hero-section {
    margin: 20px 0;
    padding: 60px 20px;
  }

  .hero-content h2 {
    font-size: 32px;
  }

  .hero-content p {
    font-size: 16px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .hero-actions .el-button {
    width: 200px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .feature-card {
    padding: 30px 20px;
  }
}
</style>
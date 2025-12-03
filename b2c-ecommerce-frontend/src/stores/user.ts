import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginForm, RegisterForm, UpdateProfileForm } from '@/types/user'
import { userApi } from '@/api/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isLoggedIn = computed(() => !!token.value)

  // 登录
  const login = async (loginForm: LoginForm) => {
    try {
      const response = await userApi.login(loginForm)
      const { token: newToken, userInfo } = response.data

      token.value = newToken
      user.value = userInfo

      localStorage.setItem('token', newToken)
      localStorage.setItem('userInfo', JSON.stringify(userInfo))

      ElMessage.success('登录成功')
      return true
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败')
      return false
    }
  }

  // 注册
  const register = async (registerForm: RegisterForm) => {
    try {
      await userApi.register(registerForm)
      ElMessage.success('注册成功，请登录')
      return true
    } catch (error: any) {
      ElMessage.error(error.message || '注册失败')
      return false
    }
  }

  // 退出登录
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    ElMessage.success('已退出登录')
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const response = await userApi.getUserInfo()
      user.value = response.data
      localStorage.setItem('userInfo', JSON.stringify(response.data))
      return response.data
    } catch (error: any) {
      ElMessage.error(error.message || '获取用户信息失败')
      return null
    }
  }

  // 更新用户信息
  const updateProfile = async (profileForm: UpdateProfileForm) => {
    try {
      const response = await userApi.updateProfile(profileForm)
      user.value = response.data
      localStorage.setItem('userInfo', JSON.stringify(response.data))
      ElMessage.success('更新成功')
      return true
    } catch (error: any) {
      ElMessage.error(error.message || '更新失败')
      return false
    }
  }

  // 初始化用户信息（从localStorage恢复）
  const initUserInfo = () => {
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      try {
        user.value = JSON.parse(userInfo)
      } catch (error) {
        console.error('解析用户信息失败:', error)
        localStorage.removeItem('userInfo')
      }
    }
  }

  // 发送验证码
  const sendCode = async (phone: string, type: 'login' | 'register' | 'reset') => {
    try {
      await userApi.sendCode(phone, type)
      ElMessage.success('验证码已发送')
      return true
    } catch (error: any) {
      ElMessage.error(error.message || '发送验证码失败')
      return false
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    register,
    logout,
    getUserInfo,
    updateProfile,
    initUserInfo,
    sendCode
  }
})
import request from './request'
import { mockApi } from './mock'
import type { LoginForm, RegisterForm, UpdateProfileForm, User } from '@/types/user'

// 是否启用Mock模式
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const userApi = {
  // 用户登录
  login: (data: LoginForm) => {
    if (USE_MOCK) {
      return mockApi.login(data)
    }
    return request({
      url: '/api/user/login',
      method: 'post',
      data
    })
  },

  // 用户注册
  register: (data: RegisterForm) => {
    if (USE_MOCK) {
      return mockApi.register(data)
    }
    return request({
      url: '/api/user/register',
      method: 'post',
      data
    })
  },

  // 获取用户信息
  getUserInfo: () => {
    if (USE_MOCK) {
      return mockApi.getUserInfo()
    }
    return request({
      url: '/api/user/info',
      method: 'get'
    })
  },

  // 更新用户信息
  updateProfile: (data: UpdateProfileForm) => {
    if (USE_MOCK) {
      return mockApi.updateProfile(data)
    }
    return request({
      url: '/api/user/profile',
      method: 'put',
      data
    })
  },

  // 发送验证码
  sendCode: (phone: string, type: 'login' | 'register' | 'reset') => {
    if (USE_MOCK) {
      return mockApi.sendCode(phone, type)
    }
    return request({
      url: '/api/user/send-code',
      method: 'post',
      data: { phone, type }
    })
  },

  // 修改密码
  changePassword: (data: { oldPassword: string; newPassword: string }) => {
    if (USE_MOCK) {
      return mockApi.changePassword(data)
    }
    return request({
      url: '/api/user/change-password',
      method: 'put',
      data
    })
  },

  // 重置密码
  resetPassword: (data: { phone: string; code: string; newPassword: string }) => {
    return request({
      url: '/api/user/reset-password',
      method: 'put',
      data
    })
  },

  // 上传头像
  uploadAvatar: (formData: FormData) => {
    if (USE_MOCK) {
      return mockApi.uploadAvatar()
    }
    return request({
      url: '/api/user/upload-avatar',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
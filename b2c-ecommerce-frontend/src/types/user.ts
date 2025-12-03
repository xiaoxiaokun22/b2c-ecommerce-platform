export interface User {
  id: number
  username: string
  email: string
  phone: string
  avatar?: string
  nickname?: string
  gender?: number // 0-未知 1-男 2-女
  birthday?: string
  status: number // 1-正常 2-禁用
  createTime: string
  updateTime: string
}

export interface LoginForm {
  username: string // 手机号或邮箱
  password: string
  code?: string // 验证码
}

export interface RegisterForm {
  username: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  code: string // 验证码
}

export interface UpdateProfileForm {
  nickname?: string
  avatar?: string
  gender?: number
  birthday?: string
}

export interface ChangePasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
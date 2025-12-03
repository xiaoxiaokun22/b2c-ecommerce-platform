// Mock API 数据
import type { LoginForm, RegisterForm, User } from '@/types/user'

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    phone: '13812345678',
    nickname: '测试用户',
    gender: 1,
    birthday: '1990-01-01',
    status: 1,
    createTime: '2023-01-01 00:00:00',
    updateTime: '2023-12-03 20:00:00'
  }
]

// 模拟token
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ'

// 模拟验证码
const mockCodes: Record<string, string> = {}

export const mockApi = {
  // 模拟登录
  login: (loginForm: LoginForm) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u =>
          (u.username === loginForm.username || u.phone === loginForm.username || u.email === loginForm.username)
        )

        if (user && loginForm.password === '123456') {
          resolve({
            code: 200,
            message: '登录成功',
            data: {
              token: mockToken,
              userInfo: user
            }
          })
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 500)
    })
  },

  // 模拟注册
  register: (registerForm: RegisterForm) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 检查验证码
        if (mockCodes[registerForm.phone] !== registerForm.code) {
          reject(new Error('验证码错误'))
          return
        }

        // 检查用户名是否已存在
        if (mockUsers.find(u => u.username === registerForm.username)) {
          reject(new Error('用户名已存在'))
          return
        }

        // 检查手机号是否已存在
        if (mockUsers.find(u => u.phone === registerForm.phone)) {
          reject(new Error('手机号已存在'))
          return
        }

        // 检查邮箱是否已存在
        if (mockUsers.find(u => u.email === registerForm.email)) {
          reject(new Error('邮箱已存在'))
          return
        }

        // 创建新用户
        const newUser: User = {
          id: mockUsers.length + 1,
          username: registerForm.username,
          email: registerForm.email,
          phone: registerForm.phone,
          nickname: registerForm.username,
          status: 1,
          createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
        }

        mockUsers.push(newUser)
        resolve({
          code: 200,
          message: '注册成功',
          data: null
        })
      }, 800)
    })
  },

  // 模拟获取用户信息
  getUserInfo: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '获取成功',
          data: mockUsers[0]
        })
      }, 300)
    })
  },

  // 模拟更新用户信息
  updateProfile: (profileForm: any) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const user = mockUsers[0]
          Object.assign(user, profileForm, {
            updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
          })

          resolve({
            code: 200,
            message: '更新成功',
            data: user
          })
        } catch (error) {
          reject(new Error('更新失败'))
        }
      }, 500)
    })
  },

  // 模拟发送验证码
  sendCode: (phone: string, type: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!/^1[3-9]\d{9}$/.test(phone)) {
          reject(new Error('手机号格式错误'))
          return
        }

        // 生成6位验证码
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        mockCodes[phone] = code

        console.log(`Mock验证码: ${code} (手机号: ${phone})`)

        resolve({
          code: 200,
          message: '验证码发送成功',
          data: null
        })
      }, 300)
    })
  },

  // 模拟修改密码
  changePassword: (data: { oldPassword: string; newPassword: string }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.oldPassword !== '123456') {
          reject(new Error('原密码错误'))
          return
        }

        if (data.newPassword.length < 6) {
          reject(new Error('新密码长度至少6位'))
          return
        }

        resolve({
          code: 200,
          message: '密码修改成功',
          data: null
        })
      }, 500)
    })
  },

  // 模拟上传头像
  uploadAvatar: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '上传成功',
          data: {
            avatar: 'https://via.placeholder.com/100x100?text=Avatar'
          }
        })
      }, 1000)
    })
  }
}
<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>欢迎登录</h2>
        <p>B2C电商平台</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入手机号或邮箱"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item v-if="needCode" prop="code">
          <div class="code-input">
            <el-input
              v-model="loginForm.code"
              placeholder="请输入验证码"
              prefix-icon="Key"
              clearable
            />
            <el-button
              :disabled="codeCountdown > 0"
              :loading="codeSending"
              @click="sendCode"
            >
              {{ codeCountdown > 0 ? `${codeCountdown}s后重试` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" @click="handleForgetPassword">忘记密码？</el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loginLoading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="login-footer">
          <span>还没有账号？</span>
          <el-link type="primary" @click="$router.push('/register')">立即注册</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { LoginForm } from '@/types/user'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  code: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入手机号或邮箱', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        const phoneReg = /^1[3-9]\d{9}$/
        const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!phoneReg.test(value) && !emailReg.test(value)) {
          callback(new Error('请输入有效的手机号或邮箱'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ]
}

// 状态变量
const loginLoading = ref(false)
const codeSending = ref(false)
const codeCountdown = ref(0)
const needCode = ref(false)
const rememberMe = ref(false)

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loginLoading.value = true

    const success = await userStore.login(loginForm)
    if (success) {
      if (rememberMe.value) {
        localStorage.setItem('rememberUsername', loginForm.username)
      } else {
        localStorage.removeItem('rememberUsername')
      }

      router.push('/system')
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loginLoading.value = false
  }
}

// 发送验证码
const sendCode = async () => {
  if (!loginForm.username) {
    ElMessage.warning('请先输入手机号或邮箱')
    return
  }

  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(loginForm.username)) {
    ElMessage.warning('验证码功能仅支持手机号')
    return
  }

  codeSending.value = true
  try {
    const success = await userStore.sendCode(loginForm.username, 'login')
    if (success) {
      codeCountdown.value = 60
      const timer = setInterval(() => {
        codeCountdown.value--
        if (codeCountdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }
  } finally {
    codeSending.value = false
  }
}

// 忘记密码
const handleForgetPassword = () => {
  ElMessage.info('请联系客服重置密码')
}

// 初始化记住的用户名
const initRememberUsername = () => {
  const remembered = localStorage.getItem('rememberUsername')
  if (remembered) {
    loginForm.username = remembered
    rememberMe.value = true
  }
}

// 组件挂载时初始化
initRememberUsername()
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: 600;
}

.login-header p {
  color: #666;
  font-size: 16px;
}

.login-form {
  width: 100%;
}

.code-input {
  display: flex;
  gap: 10px;
}

.code-input .el-input {
  flex: 1;
}

.code-input .el-button {
  white-space: nowrap;
  flex-shrink: 0;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.login-footer .el-link {
  margin-left: 5px;
}

@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }

  .code-input {
    flex-direction: column;
  }

  .code-input .el-button {
    width: 100%;
  }
}
</style>
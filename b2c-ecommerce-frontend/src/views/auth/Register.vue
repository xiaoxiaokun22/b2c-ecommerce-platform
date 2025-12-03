<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h2>用户注册</h2>
        <p>创建您的B2C电商平台账号</p>
      </div>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        size="large"
        label-position="top"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <div class="phone-input">
            <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              prefix-icon="Phone"
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

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱地址"
            prefix-icon="Message"
            clearable
          />
        </el-form-item>

        <el-form-item label="验证码" prop="code">
          <el-input
            v-model="registerForm.code"
            placeholder="请输入手机验证码"
            prefix-icon="Key"
            clearable
            maxlength="6"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <div class="register-agreement">
            <el-checkbox v-model="agreeTerms">
              我已阅读并同意
            </el-checkbox>
            <el-link type="primary" @click="showTerms">《用户服务协议》</el-link>
            <span>和</span>
            <el-link type="primary" @click="showPrivacy">《隐私政策》</el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="register-button"
            :loading="registerLoading"
            :disabled="!agreeTerms"
            @click="handleRegister"
          >
            立即注册
          </el-button>
        </el-form-item>

        <div class="register-footer">
          <span>已有账号？</span>
          <el-link type="primary" @click="$router.push('/login')">立即登录</el-link>
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
import type { RegisterForm } from '@/types/user'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const registerFormRef = ref<FormInstance>()

// 表单数据
const registerForm = reactive<RegisterForm>({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  code: ''
})

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20位', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
      message: '用户名只能包含字母、数字、下划线和中文',
      trigger: 'blur'
    }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号格式',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入正确的邮箱格式',
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,20}$/,
      message: '密码必须包含字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 状态变量
const registerLoading = ref(false)
const codeSending = ref(false)
const codeCountdown = ref(0)
const agreeTerms = ref(false)

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    if (!agreeTerms.value) {
      ElMessage.warning('请先同意用户服务协议和隐私政策')
      return
    }

    registerLoading.value = true

    const success = await userStore.register(registerForm)
    if (success) {
      router.push('/login')
    }
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    registerLoading.value = false
  }
}

// 发送验证码
const sendCode = async () => {
  if (!registerForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }

  // 验证手机号格式
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(registerForm.phone)) {
    ElMessage.warning('请输入正确的手机号格式')
    return
  }

  codeSending.value = true
  try {
    const success = await userStore.sendCode(registerForm.phone, 'register')
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

// 显示用户服务协议
const showTerms = () => {
  ElMessage.info('用户服务协议页面开发中...')
}

// 显示隐私政策
const showPrivacy = () => {
  ElMessage.info('隐私政策页面开发中...')
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-box {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: 600;
}

.register-header p {
  color: #666;
  font-size: 16px;
}

.register-form {
  width: 100%;
}

.phone-input {
  display: flex;
  gap: 10px;
}

.phone-input .el-input {
  flex: 1;
}

.phone-input .el-button {
  white-space: nowrap;
  flex-shrink: 0;
}

.register-agreement {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  font-size: 14px;
  color: #666;
}

.register-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.register-footer .el-link {
  margin-left: 5px;
}

@media (max-width: 480px) {
  .register-box {
    padding: 30px 20px;
    max-height: 95vh;
  }

  .phone-input {
    flex-direction: column;
  }

  .phone-input .el-button {
    width: 100%;
  }

  .register-agreement {
    text-align: left;
  }
}

/* 滚动条样式 */
.register-box::-webkit-scrollbar {
  width: 6px;
}

.register-box::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.register-box::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.register-box::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
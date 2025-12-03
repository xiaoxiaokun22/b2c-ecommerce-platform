<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="avatar-section">
        <el-avatar :size="100" :src="safeUserInfo.avatar" class="user-avatar">
          {{ safeUserInfo.nickname?.charAt(0) || 'U' }}
        </el-avatar>
        <el-upload
          class="avatar-upload"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :http-request="uploadAvatar"
        >
          <el-button type="primary" size="small" :loading="uploadLoading">
            更换头像
          </el-button>
        </el-upload>
      </div>
      <div class="user-info">
        <h2>{{ safeUserInfo.nickname || '未设置昵称' }}</h2>
        <p>{{ safeUserInfo.email || '未设置邮箱' }}</p>
        <p>注册时间: {{ formatDate(safeUserInfo.createTime) }}</p>
      </div>
    </div>

    <div class="profile-content">
      <el-tabs v-model="activeTab" class="profile-tabs">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="用户名">
              <el-input v-model="safeUserInfo.username" disabled />
            </el-form-item>

            <el-form-item label="昵称" prop="nickname">
              <el-input
                v-model="profileForm.nickname"
                placeholder="请输入昵称"
                clearable
              />
            </el-form-item>

            <el-form-item label="手机号">
              <el-input v-model="safeUserInfo.phone" disabled />
            </el-form-item>

            <el-form-item label="邮箱">
              <el-input v-model="safeUserInfo.email" disabled />
            </el-form-item>

            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="profileForm.gender">
                <el-radio :label="0">保密</el-radio>
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="生日" prop="birthday">
              <el-date-picker
                v-model="profileForm.birthday"
                type="date"
                placeholder="选择生日"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled-date="disabledDate"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="updateLoading" @click="updateProfile">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 账号安全 -->
        <el-tab-pane label="账号安全" name="security">
          <div class="security-section">
            <el-card class="security-card">
              <template #header>
                <div class="card-header">
                  <span>修改密码</span>
                </div>
              </template>
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="100px"
              >
                <el-form-item label="当前密码" prop="oldPassword">
                  <el-input
                    v-model="passwordForm.oldPassword"
                    type="password"
                    placeholder="请输入当前密码"
                    show-password
                  />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    placeholder="请输入新密码"
                    show-password
                  />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    show-password
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="passwordLoading" @click="changePassword">
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>

            <el-card class="security-card">
              <template #header>
                <div class="card-header">
                  <span>账号状态</span>
                </div>
              </template>
              <div class="status-info">
                <p><strong>账号状态:</strong> <el-tag :type="safeUserInfo.status === 1 ? 'success' : 'danger'">
                  {{ safeUserInfo.status === 1 ? '正常' : '已禁用' }}
                </el-tag></p>
                <p><strong>最后登录:</strong> {{ formatDate(safeUserInfo.updateTime) }}</p>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type UploadProps } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/user'
import type { UpdateProfileForm } from '@/types/user'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

// 当前激活的tab
const activeTab = ref('basic')

// 个人信息表单
const profileForm = reactive<UpdateProfileForm>({
  nickname: '',
  gender: 0,
  birthday: ''
})

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const profileRules = {
  nickname: [
    { min: 2, max: 20, message: '昵称长度为2-20位', trigger: 'blur' }
  ]
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,20}$/,
      message: '密码必须包含字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
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
const updateLoading = ref(false)
const passwordLoading = ref(false)
const uploadLoading = ref(false)

// 安全的用户信息计算属性
const safeUserInfo = computed(() => {
  return userStore.user || {
    id: 0,
    username: '',
    email: '',
    phone: '',
    nickname: '',
    gender: 0,
    birthday: '',
    status: 1,
    createTime: '',
    updateTime: '',
    avatar: ''
  }
})

// 初始化用户信息
const initUserInfo = () => {
  if (userStore.user) {
    profileForm.nickname = userStore.user.nickname || ''
    profileForm.gender = userStore.user.gender || 0
    profileForm.birthday = userStore.user.birthday || ''
  }
}

// 更新个人信息
const updateProfile = async () => {
  if (!profileFormRef.value) return

  try {
    const valid = await profileFormRef.value.validate()
    if (!valid) return

    updateLoading.value = true

    const success = await userStore.updateProfile(profileForm)
    if (success) {
      initUserInfo() // 重新初始化表单数据
    }
  } catch (error) {
    console.error('更新失败:', error)
  } finally {
    updateLoading.value = false
  }
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return

    await ElMessageBox.confirm('确定要修改密码吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    passwordLoading.value = true

    await userApi.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    ElMessage.success('密码修改成功，请重新登录')

    // 清空表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''

    // 退出登录
    setTimeout(() => {
      userStore.logout()
      router.push('/login')
    }, 1500)
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('修改密码失败:', error)
    }
  } finally {
    passwordLoading.value = false
  }
}

// 上传头像前的验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
  }

  return isJPG && isLt2M
}

// 上传头像
const uploadAvatar = async (options: any) => {
  const formData = new FormData()
  formData.append('avatar', options.file)

  uploadLoading.value = true
  try {
    const response = await userApi.uploadAvatar(formData)
    if (userStore.user) {
      userStore.user.avatar = response.data.avatar
      localStorage.setItem('userInfo', JSON.stringify(userStore.user))
    }
    ElMessage.success('头像上传成功')
  } catch (error: any) {
    ElMessage.error(error.message || '头像上传失败')
  } finally {
    uploadLoading.value = false
  }
}

// 禁用未来日期
const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 组件挂载时初始化
onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  if (!userStore.user) {
    userStore.getUserInfo().then(() => {
      initUserInfo()
    })
  } else {
    initUserInfo()
  }
})
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 30px;
}

.user-avatar {
  margin-bottom: 10px;
  border: 3px solid #f0f0f0;
}

.avatar-upload {
  margin-top: 10px;
}

.user-info h2 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.user-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.profile-content {
  margin-top: 20px;
}

.profile-tabs {
  margin-top: 20px;
}

.profile-form {
  max-width: 500px;
}

.security-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.security-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.status-info p {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-info strong {
  min-width: 80px;
}

@media (max-width: 768px) {
  .profile-container {
    margin: 10px;
    padding: 15px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .avatar-section {
    margin-right: 0;
    margin-bottom: 20px;
  }

  .profile-form {
    max-width: 100%;
  }
}
</style>
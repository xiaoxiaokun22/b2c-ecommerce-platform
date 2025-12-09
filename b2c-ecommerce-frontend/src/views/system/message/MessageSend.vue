<template>
  <div class="message-send">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>发送消息</h2>
      <div class="actions">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <!-- 发送表单 -->
    <el-card v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="发送类型" prop="sendType">
          <el-radio-group v-model="form.sendType">
            <el-radio value="single">单条发送</el-radio>
            <el-radio value="batch">群发发送</el-radio>
            <el-radio value="scheduled">定时发送</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="消息类型" prop="messageType">
          <el-select
            v-model="form.messageType"
            placeholder="请选择消息类型"
            style="width: 200px"
            @change="handleMessageTypeChange"
          >
            <el-option label="短信" value="sms" />
            <el-option label="邮件" value="email" />
            <el-option label="站内信" value="in_app" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.sendType === 'scheduled'" label="发送时间" prop="sendTime">
          <el-date-picker
            v-model="form.sendTime"
            type="datetime"
            placeholder="选择发送时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <!-- 选择模板 -->
        <el-form-item label="选择模板" prop="templateId">
          <el-select
            v-model="form.templateId"
            placeholder="请选择模板"
            style="width: 300px"
            filterable
            @change="handleTemplateChange"
          >
            <el-option
              v-for="template in templateOptions"
              :key="template.id"
              :label="template.name"
              :value="template.id"
            >
              <span>{{ template.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ getTypeText(template.type) }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="selectedTemplate" label="模板预览">
          <div class="template-preview">
            <el-descriptions :column="2" size="small" border>
              <el-descriptions-item label="标题">
                {{ selectedTemplate.title }}
              </el-descriptions-item>
              <el-descriptions-item label="类型">
                <el-tag :type="getTypeTagType(selectedTemplate.type)">
                  {{ getTypeText(selectedTemplate.type) }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
            <div class="template-content">
              <strong>内容：</strong>
              <pre>{{ selectedTemplate.content }}</pre>
            </div>
          </div>
        </el-form-item>

        <!-- 接收人 - 单条发送 -->
        <template v-if="form.sendType === 'single'">
          <el-form-item v-if="form.messageType === 'sms'" label="手机号码" prop="recipient">
            <el-input
              v-model="form.recipient"
              placeholder="请输入手机号码"
              maxlength="11"
            />
          </el-form-item>
          <el-form-item v-if="form.messageType === 'email'" label="邮箱地址" prop="recipient">
            <el-input
              v-model="form.recipient"
              placeholder="请输入邮箱地址"
            />
          </el-form-item>
          <el-form-item v-if="form.messageType === 'in_app'" label="接收用户" prop="recipient">
            <el-select
              v-model="form.recipient"
              placeholder="请选择用户"
              filterable
              remote
              :remote-method="searchUsers"
              style="width: 300px"
            >
              <el-option
                v-for="user in userOptions"
                :key="user.id"
                :label="user.name"
                :value="user.id"
              >
                <span>{{ user.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ user.phone }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </template>

        <!-- 接收人 - 群发发送 -->
        <template v-if="form.sendType === 'batch'">
          <el-form-item label="接收人群" prop="recipientGroup">
            <el-radio-group v-model="form.recipientGroup">
              <el-radio value="all">全部用户</el-radio>
              <el-radio value="vip">VIP用户</el-radio>
              <el-radio value="active">活跃用户</el-radio>
              <el-radio value="custom">自定义用户</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="form.recipientGroup === 'custom'" label="用户选择">
            <el-transfer
              v-model="form.selectedUsers"
              :data="allUsers"
              :titles="['可选用户', '已选用户']"
              :props="{ key: 'id', label: 'name' }"
              filterable
              style="text-align: left; display: inline-block;"
            />
          </el-form-item>
          <el-form-item label="预计发送数量">
            <el-tag type="info">{{ getEstimatedSendCount() }} 条</el-tag>
          </el-form-item>
        </template>

        <!-- 变量替换 -->
        <el-form-item v-if="selectedTemplate && selectedTemplate.variables.length > 0" label="变量替换">
          <div class="variable-list">
            <div
              v-for="variable in selectedTemplate.variables"
              :key="variable.name"
              class="variable-item"
            >
              <span class="variable-name">{'{ '{' }{variable.name}{' }'}}</span>
              <el-input
                v-model="variableValues[variable.name]"
                :placeholder="`请输入${variable.label}`"
                style="width: 200px; margin-left: 10px;"
              />
              <span v-if="variable.required" class="required-mark">*</span>
            </div>
          </div>
        </el-form-item>

        <!-- 发送选项 -->
        <el-form-item label="发送选项">
          <el-checkbox-group v-model="form.options">
            <el-checkbox value="retry">发送失败自动重试</el-checkbox>
            <el-checkbox value="track">追踪发送状态</el-checkbox>
            <el-checkbox v-if="form.messageType === 'email'" value="receipt">要求回执</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item v-if="form.options.includes('retry')" label="重试设置">
          <div style="margin-left: 30px;">
            <el-input-number
              v-model="form.retryConfig.maxRetries"
              :min="1"
              :max="5"
              placeholder="最大重试次数"
              style="width: 200px"
            />
            <span style="margin: 0 10px;">次</span>
            <el-select
              v-model="form.retryConfig.retryInterval"
              placeholder="重试间隔"
              style="width: 120px"
            >
              <el-option label="5分钟" value="5" />
              <el-option label="10分钟" value="10" />
              <el-option label="30分钟" value="30" />
              <el-option label="1小时" value="60" />
            </el-select>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ form.sendType === 'scheduled' ? '定时发送' : '立即发送' }}
          </el-button>
          <el-button @click="handlePreview">预览消息</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="消息预览"
      width="600px"
    >
      <div class="preview-modal">
        <h4>{{ previewData.title }}</h4>
        <div class="preview-message">
          <pre>{{ getPreviewContent() }}</pre>
        </div>
        <div v-if="form.sendType === 'batch'" class="preview-count">
          预计发送：{{ getEstimatedSendCount() }} 条
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { mockMessageTemplates } from '@/mock/message'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const formRef = ref()
const previewVisible = ref(false)
const selectedTemplate = ref<any>(null)
const templateOptions = ref<any[]>([])
const userOptions = ref<any[]>([])
const allUsers = ref<any[]>([])
const variableValues = ref<Record<string, string>>({})

// 表单数据
const form = reactive({
  sendType: 'single',
  messageType: 'sms',
  templateId: '',
  recipient: '',
  recipientGroup: 'all',
  selectedUsers: [],
  sendTime: '',
  options: ['retry'],
  retryConfig: {
    maxRetries: 3,
    retryInterval: '10'
  }
})

// 表单验证规则
const rules = {
  sendType: [
    { required: true, message: '请选择发送类型', trigger: 'change' }
  ],
  messageType: [
    { required: true, message: '请选择消息类型', trigger: 'change' }
  ],
  sendTime: [
    { required: true, message: '请选择发送时间', trigger: 'change' }
  ],
  templateId: [
    { required: true, message: '请选择模板', trigger: 'change' }
  ],
  recipient: [
    { required: true, message: '请输入接收人', trigger: 'blur' }
  ]
}

// 预览数据
const previewData = computed(() => {
  if (!selectedTemplate.value) {
    return { title: '', content: '' }
  }

  let content = selectedTemplate.value.content
  // 替换变量
  Object.entries(variableValues.value).forEach(([key, value]) => {
    content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value || `{${key}}`)
  })

  return {
    title: selectedTemplate.value.title,
    content
  }
})

// 获取类型标签类型
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    sms: 'primary',
    email: 'success',
    in_app: 'warning'
  }
  return typeMap[type] || 'info'
}

// 获取类型文本
const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    sms: '短信',
    email: '邮件',
    in_app: '站内信'
  }
  return textMap[type] || '未知'
}

// 获取预计发送数量
const getEstimatedSendCount = () => {
  if (form.sendType === 'single') {
    return 1
  } else if (form.sendType === 'batch') {
    if (form.recipientGroup === 'custom') {
      return form.selectedUsers.length
    } else if (form.recipientGroup === 'all') {
      return allUsers.value.length
    } else if (form.recipientGroup === 'vip') {
      return allUsers.value.filter(u => u.isVip).length
    } else if (form.recipientGroup === 'active') {
      return allUsers.value.filter(u => u.isActive).length
    }
  }
  return 0
}

// 获取预览内容
const getPreviewContent = () => {
  return previewData.value.content
}

// 消息类型变化
const handleMessageTypeChange = () => {
  form.templateId = ''
  selectedTemplate.value = null
  loadTemplates()
}

// 模板变化
const handleTemplateChange = () => {
  const template = templateOptions.value.find(t => t.id === form.templateId)
  if (template) {
    selectedTemplate.value = template
    // 初始化变量值
    variableValues.value = {}
    template.variables.forEach((variable: any) => {
      variableValues.value[variable.name] = ''
    })
  }
}

// 加载模板
const loadTemplates = () => {
  // 根据消息类型过滤模板
  templateOptions.value = mockMessageTemplates.filter(
    template => template.status === 'active' && template.type === form.messageType
  )
}

// 搜索用户
const searchUsers = (query: string) => {
  if (query) {
    // 模拟搜索用户
    return new Promise(resolve => {
      setTimeout(() => {
        userOptions.value = [
          { id: '1', name: '张三', phone: '13800138001', email: 'zhangsan@example.com' },
          { id: '2', name: '李四', phone: '13800138002', email: 'lisi@example.com' },
          { id: '3', name: '王五', phone: '13800138003', email: 'wangwu@example.com' }
        ].filter(user => user.name.includes(query))
        resolve(userOptions.value)
      }, 300)
    })
  }
  userOptions.value = []
}

// 提交发送
const handleSubmit = async () => {
  if (!formRef.value) return

  // 验证必填变量
  if (selectedTemplate.value && selectedTemplate.value.variables.length > 0) {
    const requiredVars = selectedTemplate.value.variables.filter((v: any) => v.required)
    const missingVars = requiredVars.filter((v: any) => !variableValues.value[v.name])
    if (missingVars.length > 0) {
      ElMessage.error(`请填写必填变量：${missingVars.map(v => v.label).join('、')}`)
      return
    }
  }

  try {
    await formRef.value.validate()

    submitting.value = true

    // 构建提交数据
    const submitData = {
      ...form,
      templateId: form.templateId,
      recipientCount: getEstimatedSendCount(),
      variables: variableValues.value,
      content: getPreviewContent()
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    ElMessage.success(form.sendType === 'scheduled' ? '定时发送任务创建成功' : '消息发送成功')
    handleBack()

  } catch (error) {
    // 表单验证失败
  } finally {
    submitting.value = false
  }
}

// 预览消息
const handlePreview = () => {
  if (!selectedTemplate.value) {
    ElMessage.warning('请先选择模板')
    return
  }
  previewVisible.value = true
}

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  selectedTemplate.value = null
  variableValues.value = {}
}

// 返回
const handleBack = () => {
  router.back()
}

// 加载用户数据
const loadUsers = () => {
  // 模拟加载用户数据
  allUsers.value = [
    { id: '1', name: '张三', phone: '13800138001', email: 'zhangsan@example.com', isVip: true, isActive: true },
    { id: '2', name: '李四', phone: '13800138002', email: 'lisi@example.com', isVip: false, isActive: true },
    { id: '3', name: '王五', phone: '13800138003', email: 'wangwu@example.com', isVip: true, isActive: false },
    { id: '4', name: '赵六', phone: '13800138004', email: 'zhaoliu@example.com', isVip: false, isActive: true },
    { id: '5', name: '钱七', phone: '13800138005', email: 'qianqi@example.com', isVip: true, isActive: true }
  ]
}

// 初始化
onMounted(() => {
  loadTemplates()
  loadUsers()
})
</script>

<style scoped>
.message-send {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.template-preview {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-top: 10px;
}

.template-content {
  margin-top: 10px;
}

.template-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  font-size: 14px;
  color: #606266;
}

.variable-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-left: 30px;
}

.variable-item {
  display: flex;
  align-items: center;
}

.variable-name {
  font-weight: 500;
  color: #409eff;
  font-family: monospace;
  min-width: 100px;
}

.required-mark {
  color: #f56c6c;
  margin-left: 5px;
}

.preview-modal h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.preview-message {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.preview-message pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.preview-count {
  font-size: 14px;
  color: #909399;
  text-align: center;
  padding-top: 10px;
}
</style>
<template>
  <div class="message-template-form">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>{{ isEdit ? '编辑消息模板' : '创建消息模板' }}</h2>
      <div class="actions">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <!-- 表单内容 -->
    <el-card v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板名称" prop="name">
              <el-input
                v-model="form.name"
                placeholder="请输入模板名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消息类型" prop="type">
              <el-select
                v-model="form.type"
                placeholder="请选择消息类型"
                style="width: 100%"
                @change="handleTypeChange"
              >
                <el-option label="短信" value="sms" />
                <el-option label="邮件" value="email" />
                <el-option label="站内信" value="in_app" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="业务类型" prop="businessType">
              <el-select
                v-model="form.businessType"
                placeholder="请选择业务类型"
                style="width: 100%"
              >
                <el-option label="订单创建" value="order_created" />
                <el-option label="支付成功" value="payment_success" />
                <el-option label="订单发货" value="order_shipped" />
                <el-option label="密码重置" value="password_reset" />
                <el-option label="促销活动" value="promotion" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio value="active">启用</el-radio>
                <el-radio value="inactive">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入消息标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="消息内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="请输入消息内容，可使用变量如：{订单号}、{用户名}等"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <!-- 变量配置 -->
        <el-form-item label="变量配置">
          <div class="variable-config">
            <div
              v-for="(variable, index) in form.variables"
              :key="index"
              class="variable-item"
            >
              <el-row :gutter="10">
                <el-col :span="4">
                  <el-input
                    v-model="variable.name"
                    placeholder="变量名"
                    @input="handleVariableNameChange(index)"
                  />
                </el-col>
                <el-col :span="4">
                  <el-input
                    v-model="variable.label"
                    placeholder="显示名称"
                  />
                </el-col>
                <el-col :span="3">
                  <el-select v-model="variable.type" placeholder="类型">
                    <el-option label="字符串" value="string" />
                    <el-option label="数字" value="number" />
                    <el-option label="日期" value="date" />
                  </el-select>
                </el-col>
                <el-col :span="2">
                  <el-checkbox v-model="variable.required">必填</el-checkbox>
                </el-col>
                <el-col :span="2">
                  <el-input
                    v-model="variable.defaultValue"
                    placeholder="默认值"
                  />
                </el-col>
                <el-col :span="2">
                  <el-button type="danger" @click="removeVariable(index)">
                    删除
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <el-button type="primary" @click="addVariable">
              <el-icon><Plus /></el-icon>
              添加变量
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="备注说明">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板的备注说明"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handlePreview" :loading="previewing">
            <el-icon><View /></el-icon>
            预览模板
          </el-button>
          <el-button type="success" @click="handleTest" :loading="testing">
            <el-icon><VideoPlay /></el-icon>
            测试发送
          </el-button>
          <el-button type="warning" @click="handleSave">
            <el-icon><Document /></el-icon>
            保存草稿
          </el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '更新模板' : '创建模板' }}
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="模板预览"
      width="600px"
    >
      <div class="preview-content">
        <h4>{{ form.title }}</h4>
        <div class="preview-message">
          <pre>{{ getPreviewContent() }}</pre>
        </div>
        <div v-if="form.variables.length > 0">
          <el-divider>变量说明</el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item
              v-for="variable in form.variables"
              :key="variable.name"
              :label="`{${variable.name}}`"
            >
              {{ variable.label }}
              <el-tag v-if="variable.required" type="danger" size="small">必填</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>

    <!-- 测试发送对话框 -->
    <el-dialog
      v-model="testVisible"
      title="测试发送"
      width="500px"
    >
      <el-form :model="testForm" label-width="100px">
        <el-form-item label="接收人" required>
          <el-input
            v-if="form.type === 'sms'"
            v-model="testForm.recipient"
            placeholder="请输入手机号码"
          />
          <el-input
            v-else-if="form.type === 'email'"
            v-model="testForm.recipient"
            placeholder="请输入邮箱地址"
          />
          <el-select
            v-else
            v-model="testForm.recipient"
            placeholder="请选择用户"
            filterable
            style="width: 100%"
          >
            <el-option label="张三" value="1" />
            <el-option label="李四" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-for="variable in form.variables.filter(v => v.required)"
          :key="variable.name"
          :label="variable.label"
          required
        >
          <el-input
            v-model="testForm.variables[variable.name]"
            :placeholder="`请输入${variable.label}`"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="testVisible = false">取消</el-button>
          <el-button type="primary" @click="handleTestSend" :loading="testSending">
            发送测试
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Plus, View, VideoPlay, Document
} from '@element-plus/icons-vue'
import { mockMessageTemplates } from '@/mock/message'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const previewing = ref(false)
const testing = ref(false)
const testSending = ref(false)
const formRef = ref()
const previewVisible = ref(false)
const testVisible = ref(false)

// 是否为编辑模式
const isEdit = computed(() => !!route.params.id)

// 表单数据
const form = reactive({
  name: '',
  type: 'sms',
  businessType: '',
  title: '',
  content: '',
  description: '',
  status: 'active',
  variables: [] as any[]
})

// 测试表单
const testForm = reactive({
  recipient: '',
  variables: {} as Record<string, string>
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择消息类型', trigger: 'change' }
  ],
  businessType: [
    { required: true, message: '请选择业务类型', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入消息标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入消息内容', trigger: 'blur' },
    { min: 5, max: 1000, message: '长度在 5 到 1000 个字符', trigger: 'blur' }
  ]
}

// 获取预览内容
const getPreviewContent = () => {
  let content = form.content
  // 替换变量为示例值
  form.variables.forEach(variable => {
    const value = testForm.variables[variable.name] || variable.defaultValue || `{${variable.label}}`
    content = content.replace(new RegExp(`\\{${variable.name}\\}`, 'g'), value)
  })
  return content
}

// 消息类型变化
const handleTypeChange = () => {
  // 根据类型调整内容格式
  if (form.type === 'sms') {
    if (!form.content) {
      form.content = '【签名】您的验证码是{code}，5分钟内有效。'
    }
  } else if (form.type === 'email') {
    if (!form.content) {
      form.content = '尊敬的{userName}，您的订单{orderNo}已创建成功。'
    }
  } else {
    if (!form.content) {
      form.content = '您好，{userName}，欢迎使用我们的系统！'
    }
  }
}

// 添加变量
const addVariable = () => {
  form.variables.push({
    name: '',
    label: '',
    type: 'string',
    required: false,
    defaultValue: ''
  })
}

// 删除变量
const removeVariable = (index: number) => {
  form.variables.splice(index, 1)
}

// 变量名变化时自动更新内容中的占位符
const handleVariableNameChange = (index: number) => {
  const variable = form.variables[index]
  if (variable.oldName && variable.name !== variable.oldName) {
    // 替换内容中的旧变量名
    form.content = form.content.replace(
      new RegExp(`\\{${variable.oldName}\\}`, 'g'),
      `{${variable.name}}`
    )
  }
  variable.oldName = variable.name
}

// 预览模板
const handlePreview = () => {
  if (!formRef.value) return

  formRef.value.validate((valid: boolean) => {
    if (valid) {
      previewVisible.value = true
    }
  })
}

// 测试发送
const handleTest = () => {
  if (!formRef.value) return

  formRef.value.validate((valid: boolean) => {
    if (valid) {
      testVisible.value = true
    }
  })
}

// 执行测试发送
const handleTestSend = async () => {
  try {
    testSending.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    ElMessage.success('测试消息发送成功')
    testVisible.value = false
  } catch (error) {
    ElMessage.error('测试发送失败')
  } finally {
    testSending.value = false
  }
}

// 保存草稿
const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    loading.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('草稿保存成功')
  } catch {
    // 表单验证失败
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    // 构建提交数据
    const submitData = {
      ...form,
      id: isEdit.value ? route.params.id : undefined
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    ElMessage.success(isEdit.value ? '模板更新成功' : '模板创建成功')
    handleBack()

  } catch {
    // 表单验证失败
  } finally {
    submitting.value = false
  }
}

// 返回
const handleBack = () => {
  router.back()
}

// 加载模板数据（编辑模式）
const loadTemplate = async () => {
  if (!isEdit.value) return

  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    const templateId = route.params.id as string
    const template = mockMessageTemplates.find(t => t.id === templateId)

    if (template) {
      Object.assign(form, template)
      // 为变量添加oldName属性用于跟踪变化
      form.variables.forEach(v => {
        v.oldName = v.name
      })
    }
  } catch (error) {
    ElMessage.error('加载模板数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  if (isEdit.value) {
    loadTemplate()
  }
})
</script>

<style scoped>
.message-template-form {
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

.variable-config {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}

.variable-item {
  margin-bottom: 15px;
}

.variable-item:last-child {
  margin-bottom: 0;
}

.preview-content h4 {
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
  font-family: monospace;
  font-size: 14px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
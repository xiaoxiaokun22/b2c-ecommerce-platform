<template>
  <div class="notification-rule-form">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>{{ isEdit ? '编辑通知规则' : '创建通知规则' }}</h2>
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
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规则名称" prop="name">
              <el-input
                v-model="form.name"
                placeholder="请输入规则名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select
                v-model="form.priority"
                placeholder="请选择优先级"
                style="width: 100%"
              >
                <el-option label="高" :value="1" />
                <el-option label="中" :value="2" />
                <el-option label="低" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="业务事件" prop="businessEvent">
          <el-select
            v-model="form.businessEvent"
            placeholder="请选择业务事件"
            style="width: 300px"
          >
            <el-option label="订单创建" value="order.created" />
            <el-option label="支付成功" value="payment.success" />
            <el-option label="订单发货" value="order.shipped" />
            <el-option label="密码重置" value="user.password_reset" />
            <el-option label="会员生日" value="member.birthday" />
            <el-option label="用户注册" value="user.register" />
          </el-select>
        </el-form-item>

        <el-form-item label="规则描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="请输入规则描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 触发条件 -->
        <el-divider content-position="left">触发条件</el-divider>

        <el-form-item label="触发方式">
          <el-radio-group v-model="form.condition.triggerMode" @change="handleTriggerModeChange">
            <el-radio value="immediate">立即触发</el-radio>
            <el-radio value="delay">延迟触发</el-radio>
            <el-radio value="schedule">定时触发</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.condition.triggerMode === 'delay'" label="延迟时间">
          <el-input-number
            v-model="form.condition.delayTime"
            :min="0"
            :max="3600"
            placeholder="请输入延迟时间（秒）"
            style="width: 200px"
          />
          <span style="margin-left: 10px;">秒后执行</span>
        </el-form-item>

        <el-form-item v-if="form.condition.triggerMode === 'schedule'" label="执行时间">
          <el-time-picker
            v-model="scheduleTime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="选择执行时间"
          />
        </el-form-item>

        <el-form-item label="触发条件">
          <div class="condition-config">
            <div
              v-for="(filter, index) in form.condition.filters"
              :key="index"
              class="filter-item"
            >
              <el-row :gutter="10">
                <el-col :span="5">
                  <el-select v-model="filter.field" placeholder="字段">
                    <el-option label="订单金额" value="orderAmount" />
                    <el-option label="商品数量" value="productCount" />
                    <el-option label="用户等级" value="userLevel" />
                    <el-option label="会员类型" value="memberType" />
                  </el-select>
                </el-col>
                <el-col :span="4">
                  <el-select v-model="filter.operator" placeholder="操作符">
                    <el-option label="大于" value=">" />
                    <el-option label="小于" value="<" />
                    <el-option label="等于" value="==" />
                    <el-option label="不等于" value="!=" />
                    <el-option label="大于等于" value=">=" />
                    <el-option label="小于等于" value="<=" />
                    <el-option label="包含" value="contains" />
                  </el-select>
                </el-col>
                <el-col :span="4">
                  <el-input
                    v-model="filter.value"
                    placeholder="比较值"
                  />
                </el-col>
                <el-col :span="2">
                  <el-button type="danger" @click="removeFilter(index)">
                    删除
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <el-button type="primary" @click="addFilter">
              <el-icon><Plus /></el-icon>
              添加条件
            </el-button>
            <span v-if="form.condition.filters.length === 0" class="no-condition-tip">
              无条件时，事件触发即执行
            </span>
          </div>
        </el-form-item>

        <!-- 执行动作 -->
        <el-divider content-position="left">执行动作</el-divider>

        <div
          v-for="(action, index) in form.actions"
          :key="index"
          class="action-config"
        >
          <el-row :gutter="20">
            <el-col :span="2">
              <el-button type="danger" @click="removeAction(index)">
                删除
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-form-item label="动作类型" label-width="80px">
                <el-select v-model="action.type" placeholder="动作类型">
                  <el-option label="发送消息" value="send_message" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="消息渠道" label-width="80px">
                <el-select v-model="action.channel" placeholder="消息渠道">
                  <el-option label="短信" value="sms" />
                  <el-option label="邮件" value="email" />
                  <el-option label="站内信" value="in_app" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="消息模板" label-width="80px">
                <el-select
                  v-model="action.templateId"
                  placeholder="选择模板"
                  filterable
                  style="width: 100%"
                >
                  <el-option
                    v-for="template in templateOptions"
                    :key="template.id"
                    :label="template.name"
                    :value="template.id"
                  >
                    <span>{{ template.name }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">
                      {{ template.type }}
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-button type="primary" @click="addAction">
          <el-icon><Plus /></el-icon>
          添加动作
        </el-button>

        <!-- 提交按钮 -->
        <el-form-item style="margin-top: 30px;">
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '更新规则' : '创建规则' }}
          </el-button>
          <el-button @click="handleTest" :loading="testing">
            <el-icon><VideoPlay /></el-icon>
            测试规则
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Plus, VideoPlay
} from '@element-plus/icons-vue'
import { mockNotificationRules, mockMessageTemplates } from '@/mock/message'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const testing = ref(false)
const formRef = ref()
const templateOptions = ref<any[]>([])
const scheduleTime = ref('')

// 是否为编辑模式
const isEdit = computed(() => !!route.params.id)

// 表单数据
const form = reactive({
  name: '',
  description: '',
  businessEvent: '',
  status: 'active',
  priority: 2,
  condition: {
    triggerMode: 'immediate',
    delayTime: 0,
    filters: [] as any[]
  },
  actions: [] as any[]
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  businessEvent: [
    { required: true, message: '请选择业务事件', trigger: 'change' }
  ]
}

// 触发方式变化
const handleTriggerModeChange = () => {
  if (form.condition.triggerMode !== 'delay') {
    form.condition.delayTime = 0
  }
}

// 添加过滤条件
const addFilter = () => {
  form.condition.filters.push({
    field: '',
    operator: '',
    value: ''
  })
}

// 删除过滤条件
const removeFilter = (index: number) => {
  form.condition.filters.splice(index, 1)
}

// 添加动作
const addAction = () => {
  form.actions.push({
    type: 'send_message',
    channel: 'sms',
    templateId: '',
    recipientType: 'user',
    recipientExpression: '{userId}'
  })
}

// 删除动作
const removeAction = (index: number) => {
  form.actions.splice(index, 1)
}

// 测试规则
const handleTest = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    testing.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    ElMessage.success('规则测试成功')
  } catch {
    // 表单验证失败
  } finally {
    testing.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 验证动作配置
    if (form.actions.length === 0) {
      ElMessage.error('请至少添加一个执行动作')
      return
    }

    for (const action of form.actions) {
      if (!action.templateId) {
        ElMessage.error('请为所有动作选择消息模板')
        return
      }
    }

    submitting.value = true

    // 处理定时时间
    if (form.condition.triggerMode === 'schedule' && scheduleTime.value) {
      form.condition.scheduleTime = scheduleTime.value
    }

    // 构建提交数据
    const submitData = {
      ...form,
      id: isEdit.value ? route.params.id : undefined,
      creator: '当前用户',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      lastTriggerTime: null
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    ElMessage.success(isEdit.value ? '规则更新成功' : '规则创建成功')
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

// 加载规则数据（编辑模式）
const loadRule = async () => {
  if (!isEdit.value) return

  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    const ruleId = route.params.id as string
    const rule = mockNotificationRules.find(r => r.id === ruleId)

    if (rule) {
      Object.assign(form, rule)
      // 处理定时时间
      if (rule.condition.scheduleTime) {
        scheduleTime.value = rule.condition.scheduleTime
      }
    }
  } catch (error) {
    ElMessage.error('加载规则数据失败')
  } finally {
    loading.value = false
  }
}

// 加载模板选项
const loadTemplates = () => {
  templateOptions.value = mockMessageTemplates.filter(t => t.status === 'active')
}

// 初始化
onMounted(() => {
  loadTemplates()
  if (isEdit.value) {
    loadRule()
  } else {
    // 默认添加一个动作
    addAction()
  }
})
</script>

<style scoped>
.notification-rule-form {
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

.condition-config {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}

.filter-item {
  margin-bottom: 15px;
}

.filter-item:last-child {
  margin-bottom: 0;
}

.no-condition-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 14px;
}

.action-config {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.el-divider {
  margin: 20px 0;
}
</style>
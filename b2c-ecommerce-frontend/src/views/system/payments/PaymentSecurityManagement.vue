<template>
  <div class="payment-security-management">
    <div class="page-header">
      <div class="header-content">
        <h2>支付安全管理</h2>
        <p>配置支付安全规则和风控策略</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddRule">
          <el-icon><Plus /></el-icon>
          添加安全规则
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 风控概览 -->
    <div class="overview-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="overview-card high-risk">
            <div class="card-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">高风险交易</div>
              <div class="card-value">{{ riskStats.highRiskCount }}</div>
              <div class="card-desc">今日检测到</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card medium-risk">
            <div class="card-icon">
              <el-icon><InfoFilled /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">中风险交易</div>
              <div class="card-value">{{ riskStats.mediumRiskCount }}</div>
              <div class="card-desc">今日检测到</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card blocked">
            <div class="card-icon">
              <el-icon><CircleCloseFilled /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">拦截交易</div>
              <div class="card-value">{{ riskStats.blockedCount }}</div>
              <div class="card-desc">今日拦截</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card manual-review">
            <div class="card-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">人工审核</div>
              <div class="card-value">{{ riskStats.manualReviewCount }}</div>
              <div class="card-desc">待处理</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="规则类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable style="width: 150px">
            <el-option label="金额限制" value="amount_limit" />
            <el-option label="频率限制" value="frequency_limit" />
            <el-option label="IP白名单" value="ip_whitelist" />
            <el-option label="IP黑名单" value="ip_blacklist" />
            <el-option label="风险评分" value="risk_score" />
            <el-option label="自定义规则" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 安全规则列表 -->
    <div class="rules-section">
      <h3>安全规则列表</h3>
      <el-table
        v-loading="loading"
        :data="rulesList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="规则名称" min-width="200" />
        <el-table-column prop="type" label="规则类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getRuleTypeColor(row.type)">
              {{ getRuleTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100" />
        <el-table-column label="触发条件" min-width="250">
          <template #default="{ row }">
            <div class="condition-list">
              <div v-for="(condition, index) in row.conditions" :key="index" class="condition-item">
                {{ formatCondition(condition) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="处理动作" min-width="200">
          <template #default="{ row }">
            <div class="action-list">
              <el-tag
                v-for="action in row.actions"
                :key="action.type"
                size="small"
                :type="getActionTypeColor(action.type)"
                class="action-tag"
              >
                {{ getActionTypeName(action.type) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              size="small"
              :type="row.status === 'active' ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 风险事件列表 -->
    <div class="events-section">
      <h3>近期风险事件</h3>
      <el-table
        v-loading="eventsLoading"
        :data="riskEvents"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="orderId" label="订单号" width="150" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            ¥{{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="riskLevel" label="风险等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getRiskLevelColor(row.riskLevel)">
              {{ getRiskLevelName(row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="riskScore" label="风险评分" width="100">
          <template #default="{ row }">
            <span :class="getRiskScoreClass(row.riskScore)">{{ row.riskScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="riskReason" label="风险原因" min-width="200" />
        <el-table-column prop="action" label="处理动作" width="120">
          <template #default="{ row }">
            <el-tag :type="getActionTypeColor(row.action)">
              {{ getActionTypeName(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="clientInfo.ip" label="客户端IP" width="130" />
        <el-table-column prop="createdAt" label="发生时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewEvent(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑规则对话框 -->
    <el-dialog
      v-model="ruleDialogVisible"
      :title="ruleDialogTitle"
      width="900px"
      destroy-on-close
    >
      <el-form
        ref="ruleFormRef"
        :model="ruleFormData"
        :rules="ruleFormRules"
        label-width="120px"
      >
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleFormData.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="规则类型" prop="type">
          <el-select v-model="ruleFormData.type" placeholder="请选择规则类型" style="width: 100%">
            <el-option label="金额限制" value="amount_limit" />
            <el-option label="频率限制" value="frequency_limit" />
            <el-option label="IP白名单" value="ip_whitelist" />
            <el-option label="IP黑名单" value="ip_blacklist" />
            <el-option label="风险评分" value="risk_score" />
            <el-option label="自定义规则" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="ruleFormData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="ruleFormData.priority" :min="1" :max="100" placeholder="请输入优先级" style="width: 100%" />
        </el-form-item>
        <el-form-item label="触发条件">
          <div class="conditions-container">
            <div v-for="(condition, index) in ruleFormData.conditions" :key="index" class="condition-row">
              <el-select v-model="condition.field" placeholder="字段" style="width: 150px">
                <el-option label="支付金额" value="amount" />
                <el-option label="1小时内支付次数" value="payment_count_1h" />
                <el-option label="24小时内支付次数" value="payment_count_24h" />
                <el-option label="客户端IP" value="client_ip" />
                <el-option label="风险评分" value="risk_score" />
                <el-option label="设备ID" value="device_id" />
              </el-select>
              <el-select v-model="condition.operator" placeholder="操作符" style="width: 120px; margin-left: 10px">
                <el-option label="等于" value="eq" />
                <el-option label="不等于" value="ne" />
                <el-option label="大于" value="gt" />
                <el-option label="大于等于" value="gte" />
                <el-option label="小于" value="lt" />
                <el-option label="小于等于" value="lte" />
                <el-option label="包含" value="in" />
                <el-option label="不包含" value="not_in" />
              </el-select>
              <el-input v-model="condition.value" placeholder="值" style="width: 150px; margin-left: 10px" />
              <el-select v-model="condition.logicalOperator" placeholder="逻辑" style="width: 80px; margin-left: 10px" v-if="index < ruleFormData.conditions.length - 1">
                <el-option label="且" value="and" />
                <el-option label="或" value="or" />
              </el-select>
              <el-button type="danger" size="small" @click="removeCondition(index)" style="margin-left: 10px">
                删除
              </el-button>
            </div>
            <el-button type="primary" size="small" @click="addCondition" style="margin-top: 10px">
              添加条件
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="处理动作">
          <div class="actions-container">
            <div v-for="(action, index) in ruleFormData.actions" :key="index" class="action-row">
              <el-select v-model="action.type" placeholder="动作类型" style="width: 150px">
                <el-option label="拦截" value="block" />
                <el-option label="人工审核" value="manual_review" />
                <el-option label="额外验证" value="additional_verification" />
                <el-option label="告警" value="alert" />
                <el-option label="记录" value="log" />
              </el-select>
              <el-input v-model="action.parameters.reason" placeholder="原因说明" style="width: 200px; margin-left: 10px" v-if="action.type === 'block'" />
              <el-button type="danger" size="small" @click="removeAction(index)" style="margin-left: 10px">
                删除
              </el-button>
            </div>
            <el-button type="primary" size="small" @click="addAction" style="margin-top: 10px">
              添加动作
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="ruleFormData.description" type="textarea" :rows="3" placeholder="请输入规则描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRuleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Refresh, Search, Warning, InfoFilled, CircleCloseFilled, UserFilled } from '@element-plus/icons-vue'
import { paymentSecurityApi, type PaymentSecurityRule } from '../../../api/payment'

// 响应式数据
const loading = ref(false)
const eventsLoading = ref(false)
const submitting = ref(false)
const ruleDialogVisible = ref(false)
const ruleDialogTitle = ref('')
const isEdit = ref(false)
const rulesList = ref<PaymentSecurityRule[]>([])
const riskEvents = ref<any[]>([])

// 风险统计数据
const riskStats = reactive({
  highRiskCount: 15,
  mediumRiskCount: 50,
  lowRiskCount: 1185,
  blockedCount: 5,
  manualReviewCount: 25
})

// 搜索表单
const searchForm = reactive({
  type: '',
  status: ''
})

// 规则表单数据
const ruleFormData = reactive<Partial<PaymentSecurityRule>>({
  name: '',
  type: 'amount_limit',
  status: 'active',
  conditions: [
    {
      field: 'amount',
      operator: 'gt',
      value: '',
      logicalOperator: 'and'
    }
  ],
  actions: [
    {
      type: 'manual_review',
      parameters: { reason: '' }
    }
  ],
  priority: 1,
  description: ''
})

// 表单引用
const ruleFormRef = ref<FormInstance>()

// 表单验证规则
const ruleFormRules: FormRules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择规则类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请输入优先级', trigger: 'blur' }
  ]
}

// 方法
const loadRules = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    import('../../../api/mock/payment').then(({ mockPaymentSecurityRules }) => {
      let filteredData = mockPaymentSecurityRules

      // 应用搜索过滤
      if (searchForm.type) {
        filteredData = filteredData.filter(item => item.type === searchForm.type)
      }
      if (searchForm.status) {
        filteredData = filteredData.filter(item => item.status === searchForm.status)
      }

      rulesList.value = filteredData.sort((a, b) => a.priority - b.priority)
    })
  } catch (error) {
    ElMessage.error('加载安全规则失败')
    console.error('加载安全规则失败:', error)
  } finally {
    loading.value = false
  }
}

const loadRiskEvents = async () => {
  eventsLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 生成模拟风险事件数据
    riskEvents.value = Array.from({ length: 20 }, (_, index) => ({
      id: `event_${index + 1}`,
      orderId: `order_${Math.floor(Math.random() * 100) + 1}`,
      amount: Math.floor(Math.random() * 10000) + 100,
      riskLevel: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
      riskScore: Math.floor(Math.random() * 100),
      riskReason: ['异常IP地址', '高额支付', '频繁支付', '设备异常'][Math.floor(Math.random() * 4)],
      action: ['block', 'manual_review', 'alert', 'log'][Math.floor(Math.random() * 4)],
      clientInfo: {
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    }))
  } catch (error) {
    ElMessage.error('加载风险事件失败')
    console.error('加载风险事件失败:', error)
  } finally {
    eventsLoading.value = false
  }
}

const handleSearch = () => {
  loadRules()
}

const handleReset = () => {
  Object.assign(searchForm, {
    type: '',
    status: ''
  })
  loadRules()
}

const handleRefresh = () => {
  loadRules()
  loadRiskEvents()
}

const handleAddRule = () => {
  isEdit.value = false
  ruleDialogTitle.value = '添加安全规则'
  Object.assign(ruleFormData, {
    name: '',
    type: 'amount_limit',
    status: 'active',
    conditions: [
      {
        field: 'amount',
        operator: 'gt',
        value: '',
        logicalOperator: 'and'
      }
    ],
    actions: [
      {
        type: 'manual_review',
        parameters: { reason: '' }
      }
    ],
    priority: 1,
    description: ''
  })
  ruleDialogVisible.value = true
}

const handleEdit = (row: PaymentSecurityRule) => {
  isEdit.value = true
  ruleDialogTitle.value = '编辑安全规则'
  Object.assign(ruleFormData, JSON.parse(JSON.stringify(row)))
  ruleDialogVisible.value = true
}

const handleRuleSubmit = async () => {
  if (!ruleFormRef.value) return

  try {
    await ruleFormRef.value.validate()
    submitting.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success(isEdit.value ? '更新规则成功' : '创建规则成功')
    ruleDialogVisible.value = false
    loadRules()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(isEdit.value ? '更新规则失败' : '创建规则失败')
      console.error('提交规则失败:', error)
    }
  } finally {
    submitting.value = false
  }
}

const handleToggleStatus = async (row: PaymentSecurityRule) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  const actionText = newStatus === 'active' ? '启用' : '停用'

  try {
    await ElMessageBox.confirm(`确定要${actionText}规则"${row.name}"吗？`, '确认操作', {
      type: 'warning'
    })

    // 调用API
    // await paymentSecurityApi.updateRuleStatus(row.id, newStatus)
    await new Promise(resolve => setTimeout(resolve, 500))

    ElMessage.success(`${actionText}成功`)
    loadRules()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${actionText}失败`)
      console.error('切换状态失败:', error)
    }
  }
}

const handleDelete = async (row: PaymentSecurityRule) => {
  try {
    await ElMessageBox.confirm(`确定要删除规则"${row.name}"吗？此操作不可恢复。`, '确认删除', {
      type: 'warning'
    })

    // 调用API
    // await paymentSecurityApi.deleteRule(row.id)
    await new Promise(resolve => setTimeout(resolve, 500))

    ElMessage.success('删除成功')
    loadRules()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除失败:', error)
    }
  }
}

const handleViewEvent = (row: any) => {
  ElMessage.info(`查看风险事件详情: ${row.orderId}`)
}

const addCondition = () => {
  ruleFormData.conditions!.push({
    field: 'amount',
    operator: 'gt',
    value: '',
    logicalOperator: 'and'
  })
}

const removeCondition = (index: number) => {
  if (ruleFormData.conditions!.length > 1) {
    ruleFormData.conditions!.splice(index, 1)
  } else {
    ElMessage.warning('至少需要一个条件')
  }
}

const addAction = () => {
  ruleFormData.actions!.push({
    type: 'manual_review',
    parameters: { reason: '' }
  })
}

const removeAction = (index: number) => {
  if (ruleFormData.actions!.length > 1) {
    ruleFormData.actions!.splice(index, 1)
  } else {
    ElMessage.warning('至少需要一个动作')
  }
}

// 辅助方法
const getRuleTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    amount_limit: '金额限制',
    frequency_limit: '频率限制',
    ip_whitelist: 'IP白名单',
    ip_blacklist: 'IP黑名单',
    risk_score: '风险评分',
    custom: '自定义规则'
  }
  return typeMap[type] || type
}

const getRuleTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    amount_limit: 'primary',
    frequency_limit: 'warning',
    ip_whitelist: 'success',
    ip_blacklist: 'danger',
    risk_score: 'info',
    custom: ''
  }
  return colorMap[type] || ''
}

const getActionTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    block: '拦截',
    manual_review: '人工审核',
    additional_verification: '额外验证',
    alert: '告警',
    log: '记录'
  }
  return typeMap[type] || type
}

const getActionTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    block: 'danger',
    manual_review: 'warning',
    additional_verification: 'primary',
    alert: 'info',
    log: ''
  }
  return colorMap[type] || ''
}

const getRiskLevelName = (level: string) => {
  const levelMap: Record<string, string> = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
  }
  return levelMap[level] || level
}

const getRiskLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  }
  return colorMap[level] || ''
}

const getRiskScoreClass = (score: number) => {
  if (score >= 80) return 'risk-score-high'
  if (score >= 50) return 'risk-score-medium'
  return 'risk-score-low'
}

const formatCondition = (condition: any) => {
  const fieldMap: Record<string, string> = {
    amount: '支付金额',
    payment_count_1h: '1小时内支付次数',
    payment_count_24h: '24小时内支付次数',
    client_ip: '客户端IP',
    risk_score: '风险评分',
    device_id: '设备ID'
  }

  const operatorMap: Record<string, string> = {
    eq: '等于',
    ne: '不等于',
    gt: '大于',
    gte: '大于等于',
    lt: '小于',
    lte: '小于等于',
    in: '包含',
    not_in: '不包含'
  }

  const fieldName = fieldMap[condition.field] || condition.field
  const operatorName = operatorMap[condition.operator] || condition.operator
  const logicalOperator = condition.logicalOperator === 'and' ? '且' : '或'

  return `${fieldName} ${operatorName} ${condition.value}${condition.logicalOperator ? ` ${logicalOperator}` : ''}`
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadRules()
  loadRiskEvents()
})
</script>

<style scoped>
.payment-security-management {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.header-content h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-content p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.overview-section {
  margin-bottom: 20px;
}

.overview-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.overview-card.high-risk {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.overview-card.medium-risk {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.overview-card.blocked {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.overview-card.manual-review {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.card-icon {
  font-size: 32px;
  margin-right: 16px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 12px;
  opacity: 0.8;
}

.search-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.rules-section, .events-section {
  margin-bottom: 20px;
}

.rules-section h3, .events-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.condition-list, .action-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.condition-item {
  font-size: 12px;
  padding: 2px 6px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border: 1px solid #e1f5fe;
}

.action-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.conditions-container, .actions-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  background-color: #fafafa;
}

.condition-row, .action-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.condition-row:last-child, .action-row:last-child {
  margin-bottom: 0;
}

.risk-score-high {
  color: #f56c6c;
  font-weight: bold;
}

.risk-score-medium {
  color: #e6a23c;
  font-weight: bold;
}

.risk-score-low {
  color: #67c23a;
  font-weight: bold;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
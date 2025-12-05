<template>
  <div class="payment-channel-management">
    <div class="page-header">
      <div class="header-content">
        <h2>支付渠道管理</h2>
        <p>管理平台的支付渠道配置和状态</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加支付渠道
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="渠道类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable style="width: 150px">
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wechat" />
            <el-option label="银联支付" value="unionpay" />
            <el-option label="PayPal" value="paypal" />
            <el-option label="Stripe" value="stripe" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="searchForm.keyword" placeholder="搜索渠道名称" clearable style="width: 200px" />
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

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="channelList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="渠道名称" min-width="150">
          <template #default="{ row }">
            <div class="channel-info">
              <img :src="row.icon" :alt="row.name" class="channel-icon" v-if="row.icon" />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="渠道类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getChannelTypeColor(row.type)">
              {{ getChannelTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="config.feeRate" label="费率" width="100">
          <template #default="{ row }">
            {{ (row.config.feeRate * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column prop="config.environment" label="环境" width="100">
          <template #default="{ row }">
            <el-tag :type="row.config.environment === 'production' ? 'success' : 'warning'">
              {{ row.config.environment === 'production' ? '生产' : '测试' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="config.supportedCurrencies" label="支持货币" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="currency in row.config.supportedCurrencies"
              :key="currency"
              size="small"
              class="currency-tag"
            >
              {{ currency }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" @click="handleTest(row)">测试</el-button>
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small" type="primary">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="toggle-status">
                    {{ row.status === 'active' ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 添加/编辑渠道对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="渠道名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入渠道名称" />
        </el-form-item>
        <el-form-item label="渠道类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择渠道类型" style="width: 100%">
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wechat" />
            <el-option label="银联支付" value="unionpay" />
            <el-option label="PayPal" value="paypal" />
            <el-option label="Stripe" value="stripe" />
          </el-select>
        </el-form-item>
        <el-form-item label="渠道图标" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入图标URL" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="应用ID" prop="config.appId">
          <el-input v-model="formData.config.appId" placeholder="请输入应用ID" />
        </el-form-item>
        <el-form-item label="商户ID" prop="config.merchantId">
          <el-input v-model="formData.config.merchantId" placeholder="请输入商户ID" />
        </el-form-item>
        <el-form-item label="应用密钥" prop="config.appSecret">
          <el-input v-model="formData.config.appSecret" type="password" placeholder="请输入应用密钥" show-password />
        </el-form-item>
        <el-form-item label="公钥" prop="config.publicKey" v-if="needKeys">
          <el-input v-model="formData.config.publicKey" type="textarea" :rows="3" placeholder="请输入公钥" />
        </el-form-item>
        <el-form-item label="私钥" prop="config.privateKey" v-if="needKeys">
          <el-input v-model="formData.config.privateKey" type="textarea" :rows="3" placeholder="请输入私钥" show-password />
        </el-form-item>
        <el-form-item label="通知地址" prop="config.notifyUrl">
          <el-input v-model="formData.config.notifyUrl" placeholder="请输入异步通知地址" />
        </el-form-item>
        <el-form-item label="返回地址" prop="config.returnUrl">
          <el-input v-model="formData.config.returnUrl" placeholder="请输入同步返回地址" />
        </el-form-item>
        <el-form-item label="环境" prop="config.environment">
          <el-select v-model="formData.config.environment" placeholder="请选择环境" style="width: 100%">
            <el-option label="生产环境" value="production" />
            <el-option label="测试环境" value="sandbox" />
          </el-select>
        </el-form-item>
        <el-form-item label="费率" prop="config.feeRate">
          <el-input-number
            v-model="formData.config.feeRate"
            :min="0"
            :max="1"
            :step="0.0001"
            :precision="4"
            placeholder="请输入费率"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="最小金额" prop="config.minAmount">
          <el-input-number
            v-model="formData.config.minAmount"
            :min="0"
            :precision="2"
            placeholder="请输入最小支付金额"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="最大金额" prop="config.maxAmount">
          <el-input-number
            v-model="formData.config.maxAmount"
            :min="0"
            :precision="2"
            placeholder="请输入最大支付金额"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="支持货币" prop="config.supportedCurrencies">
          <el-select v-model="formData.config.supportedCurrencies" multiple placeholder="请选择支持的货币" style="width: 100%">
            <el-option label="人民币" value="CNY" />
            <el-option label="美元" value="USD" />
            <el-option label="欧元" value="EUR" />
            <el-option label="英镑" value="GBP" />
            <el-option label="日元" value="JPY" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入渠道描述" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" placeholder="请输入排序值" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Refresh, Search, ArrowDown } from '@element-plus/icons-vue'
import { paymentChannelApi } from '@/api/payment'
import type { PaymentChannel } from '@/types/payment'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const channelList = ref<PaymentChannel[]>([])

// 搜索表单
const searchForm = reactive({
  type: '',
  status: '',
  keyword: ''
})

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 表单数据
const formData = reactive<Partial<PaymentChannel>>({
  name: '',
  type: 'alipay',
  status: 'active',
  icon: '',
  config: {
    appId: '',
    appSecret: '',
    merchantId: '',
    publicKey: '',
    privateKey: '',
    notifyUrl: '',
    returnUrl: '',
    environment: 'sandbox',
    feeRate: 0.006,
    minAmount: 0.01,
    maxAmount: 50000,
    supportedCurrencies: ['CNY']
  },
  description: '',
  sort: 0
})

// 表单引用
const formRef = ref<FormInstance>()

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入渠道名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择渠道类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  'config.appId': [
    { required: true, message: '请输入应用ID', trigger: 'blur' }
  ],
  'config.merchantId': [
    { required: true, message: '请输入商户ID', trigger: 'blur' }
  ],
  'config.appSecret': [
    { required: true, message: '请输入应用密钥', trigger: 'blur' }
  ],
  'config.notifyUrl': [
    { required: true, message: '请输入异步通知地址', trigger: 'blur' }
  ],
  'config.returnUrl': [
    { required: true, message: '请输入同步返回地址', trigger: 'blur' }
  ],
  'config.environment': [
    { required: true, message: '请选择环境', trigger: 'change' }
  ],
  'config.feeRate': [
    { required: true, message: '请输入费率', trigger: 'blur' }
  ],
  'config.minAmount': [
    { required: true, message: '请输入最小支付金额', trigger: 'blur' }
  ],
  'config.maxAmount': [
    { required: true, message: '请输入最大支付金额', trigger: 'blur' }
  ],
  'config.supportedCurrencies': [
    { required: true, message: '请选择支持的货币', trigger: 'change' }
  ]
}

// 计算属性
const needKeys = computed(() => {
  return ['alipay', 'wechat'].includes(formData.type || '')
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用，实际项目中应该调用真实的API
    await new Promise(resolve => setTimeout(resolve, 500))

    // 这里应该调用 paymentChannelApi.getList()
    // 为了演示，我们使用模拟数据
    import('@/api/mock/payment').then(({ mockPaymentChannels }) => {
      let filteredData = mockPaymentChannels

      // 应用搜索过滤
      if (searchForm.type) {
        filteredData = filteredData.filter(item => item.type === searchForm.type)
      }
      if (searchForm.status) {
        filteredData = filteredData.filter(item => item.status === searchForm.status)
      }
      if (searchForm.keyword) {
        filteredData = filteredData.filter(item =>
          item.name.toLowerCase().includes(searchForm.keyword.toLowerCase())
        )
      }

      // 分页处理
      const startIndex = (pagination.page - 1) * pagination.pageSize
      const endIndex = startIndex + pagination.pageSize
      channelList.value = filteredData.slice(startIndex, endIndex)
      pagination.total = filteredData.length
    })
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    type: '',
    status: '',
    keyword: ''
  })
  pagination.page = 1
  loadData()
}

const handleRefresh = () => {
  loadData()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadData()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加支付渠道'
  Object.assign(formData, {
    name: '',
    type: 'alipay',
    status: 'active',
    icon: '',
    config: {
      appId: '',
      appSecret: '',
      merchantId: '',
      publicKey: '',
      privateKey: '',
      notifyUrl: '',
      returnUrl: '',
      environment: 'sandbox',
      feeRate: 0.006,
      minAmount: 0.01,
      maxAmount: 50000,
      supportedCurrencies: ['CNY']
    },
    description: '',
    sort: 0
  })
  dialogVisible.value = true
}

const handleEdit = (row: PaymentChannel) => {
  isEdit.value = true
  dialogTitle.value = '编辑支付渠道'
  Object.assign(formData, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (isEdit.value) {
      // 调用更新API
      // await paymentChannelApi.update(formData.id!, formData)
      ElMessage.success('更新成功')
    } else {
      // 调用创建API
      // await paymentChannelApi.create(formData)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      console.error('提交失败:', error)
    }
  } finally {
    submitting.value = false
  }
}

const handleTest = async (row: PaymentChannel) => {
  try {
    ElMessage.info('正在测试配置...')
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    // await paymentChannelApi.testConfig(row.id)
    ElMessage.success('配置测试成功')
  } catch (error) {
    ElMessage.error('配置测试失败')
    console.error('测试失败:', error)
  }
}

const handleCommand = async (command: string, row: PaymentChannel) => {
  switch (command) {
    case 'toggle-status':
      await handleToggleStatus(row)
      break
    case 'delete':
      await handleDelete(row)
      break
  }
}

const handleToggleStatus = async (row: PaymentChannel) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  const actionText = newStatus === 'active' ? '启用' : '停用'

  try {
    await ElMessageBox.confirm(`确定要${actionText}支付渠道"${row.name}"吗？`, '确认操作', {
      type: 'warning'
    })

    // 调用API
    // await paymentChannelApi.updateStatus(row.id, newStatus)
    await new Promise(resolve => setTimeout(resolve, 500))

    ElMessage.success(`${actionText}成功`)
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${actionText}失败`)
      console.error('切换状态失败:', error)
    }
  }
}

const handleDelete = async (row: PaymentChannel) => {
  try {
    await ElMessageBox.confirm(`确定要删除支付渠道"${row.name}"吗？此操作不可恢复。`, '确认删除', {
      type: 'warning'
    })

    // 调用API
    // await paymentChannelApi.delete(row.id)
    await new Promise(resolve => setTimeout(resolve, 500))

    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除失败:', error)
    }
  }
}

// 辅助方法
const getChannelTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    unionpay: '银联支付',
    paypal: 'PayPal',
    stripe: 'Stripe'
  }
  return typeMap[type] || type
}

const getChannelTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    alipay: 'primary',
    wechat: 'success',
    unionpay: 'warning',
    paypal: 'info',
    stripe: 'danger'
  }
  return colorMap[type] || ''
}

const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '启用',
    inactive: '停用',
    disabled: '禁用'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    active: 'success',
    inactive: 'warning',
    disabled: 'danger'
  }
  return colorMap[status] || ''
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.payment-channel-management {
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

.search-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.table-section {
  margin-bottom: 20px;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.channel-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.currency-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
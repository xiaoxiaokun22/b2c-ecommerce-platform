<template>
  <div class="reconciliation-management">
    <div class="page-header">
      <div class="header-content">
        <h2>对账系统</h2>
        <p>支付渠道对账和差异管理</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleTriggerReconciliation">
          <el-icon><Refresh /></el-icon>
          手动对账
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="overview-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="overview-card today">
            <div class="card-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">今日对账</div>
              <div class="card-value">{{ stats.todayCount }}</div>
              <div class="card-desc">笔交易，金额 ¥{{ stats.todayAmount.toFixed(2) }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card success">
            <div class="card-icon">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">对账成功</div>
              <div class="card-value">{{ stats.successCount }}</div>
              <div class="card-desc">成功率 {{ stats.successRate.toFixed(1) }}%</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card pending">
            <div class="card-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">待处理</div>
              <div class="card-value">{{ stats.pendingCount }}</div>
              <div class="card-desc">需要人工处理</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card difference">
            <div class="card-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">发现差异</div>
              <div class="card-value">{{ stats.differenceCount }}</div>
              <div class="card-desc">差异金额 ¥{{ stats.differenceAmount.toFixed(2) }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="对账日期">
          <el-date-picker
            v-model="searchForm.date"
            type="date"
            placeholder="请选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="支付渠道">
          <el-select v-model="searchForm.paymentChannel" placeholder="请选择" clearable style="width: 150px">
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wechat" />
            <el-option label="银联支付" value="unionpay" />
          </el-select>
        </el-form-item>
        <el-form-item label="对账状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="待对账" value="pending" />
            <el-option label="对账中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
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

    <!-- 对账记录列表 -->
    <div class="table-section">
      <h3>对账记录</h3>
      <el-table
        v-loading="loading"
        :data="reconciliationList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="date" label="对账日期" width="120" />
        <el-table-column prop="paymentChannel" label="支付渠道" width="120" />
        <el-table-column prop="totalCount" label="总笔数" width="100">
          <template #default="{ row }">
            <span class="count-number">{{ row.totalCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="{ row }">
            <span class="amount-number">¥{{ row.totalAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="successCount" label="成功笔数" width="100" />
        <el-table-column prop="successAmount" label="成功金额" width="120">
          <template #default="{ row }">
            <span class="success-amount">¥{{ row.successAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="failedCount" label="失败笔数" width="100">
          <template #default="{ row }">
            <span class="failed-count">{{ row.failedCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="failedAmount" label="失败金额" width="120">
          <template #default="{ row }">
            <span class="failed-amount">¥{{ row.failedAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundCount" label="退款笔数" width="100" />
        <el-table-column prop="refundAmount" label="退款金额" width="120">
          <template #default="{ row }">
            <span class="refund-amount">¥{{ row.refundAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="feeAmount" label="手续费" width="120">
          <template #default="{ row }">
            <span class="fee-amount">¥{{ row.feeAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="actualAmount" label="实际金额" width="120">
          <template #default="{ row }">
            <span class="actual-amount">¥{{ row.actualAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="processedBy" label="处理人" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'completed' && row.reportPath"
              size="small"
              type="primary"
              @click="handleDownloadReport(row)"
            >
              下载报告
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="success"
              @click="handleProcessReconciliation(row)"
            >
              处理差异
            </el-button>
            <el-button
              v-if="row.status === 'failed'"
              size="small"
              type="warning"
              @click="handleRetryReconciliation(row)"
            >
              重试
            </el-button>
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

    <!-- 手动对账对话框 -->
    <el-dialog
      v-model="triggerDialogVisible"
      title="手动触发对账"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="triggerFormRef"
        :model="triggerForm"
        :rules="triggerFormRules"
        label-width="120px"
      >
        <el-form-item label="对账日期" prop="date">
          <el-date-picker
            v-model="triggerForm.date"
            type="date"
            placeholder="请选择对账日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="支付渠道" prop="paymentChannel">
          <el-select v-model="triggerForm.paymentChannel" placeholder="请选择支付渠道" style="width: 100%">
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wechat" />
            <el-option label="银联支付" value="unionpay" />
            <el-option label="全部渠道" value="all" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="triggerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTriggerSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 对账详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="对账详情"
      width="1200px"
      destroy-on-close
    >
      <div v-if="selectedReconciliation" class="reconciliation-detail">
        <!-- 基本信息 -->
        <el-descriptions :column="3" border class="detail-section">
          <el-descriptions-item label="对账日期">{{ selectedReconciliation.date }}</el-descriptions-item>
          <el-descriptions-item label="支付渠道">{{ selectedReconciliation.paymentChannel }}</el-descriptions-item>
          <el-descriptions-item label="对账状态">
            <el-tag :type="getStatusColor(selectedReconciliation.status)">
              {{ getStatusName(selectedReconciliation.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="总笔数">{{ selectedReconciliation.totalCount }}</el-descriptions-item>
          <el-descriptions-item label="总金额">¥{{ selectedReconciliation.totalAmount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ selectedReconciliation.processedBy || '-' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 统计信息 -->
        <div class="stats-section">
          <h4>统计信息</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-title">成功交易</div>
                <div class="stat-value">{{ selectedReconciliation.successCount }}</div>
                <div class="stat-desc">¥{{ selectedReconciliation.successAmount.toFixed(2) }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-title">失败交易</div>
                <div class="stat-value">{{ selectedReconciliation.failedCount }}</div>
                <div class="stat-desc">¥{{ selectedReconciliation.failedAmount.toFixed(2) }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-title">退款交易</div>
                <div class="stat-value">{{ selectedReconciliation.refundCount }}</div>
                <div class="stat-desc">¥{{ selectedReconciliation.refundAmount.toFixed(2) }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 差异列表 -->
        <div class="differences-section" v-if="differences.length > 0">
          <h4>差异记录</h4>
          <el-table :data="differences" border stripe style="width: 100%">
            <el-table-column prop="type" label="差异类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getDifferenceTypeColor(row.type)">
                  {{ getDifferenceTypeName(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="orderId" label="订单号" width="150" />
            <el-table-column prop="paymentId" label="支付单号" width="150" />
            <el-table-column prop="systemAmount" label="系统金额" width="120">
              <template #default="{ row }">
                ¥{{ row.systemAmount?.toFixed(2) || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="channelAmount" label="渠道金额" width="120">
              <template #default="{ row }">
                ¥{{ row.channelAmount?.toFixed(2) || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="differenceAmount" label="差异金额" width="120">
              <template #default="{ row }">
                <span class="difference-amount">¥{{ row.differenceAmount?.toFixed(2) || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="差异描述" min-width="200" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'resolved' ? 'success' : row.status === 'ignored' ? 'info' : 'warning'">
                  {{ row.status === 'resolved' ? '已解决' : row.status === 'ignored' ? '已忽略' : '待处理' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'pending'"
                  size="small"
                  type="primary"
                  @click="handleResolveDifference(row)"
                >
                  处理
                </el-button>
                <el-button size="small" @click="handleViewDifference(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 处理差异对话框 -->
    <el-dialog
      v-model="resolveDialogVisible"
      title="处理差异"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="resolveFormRef"
        :model="resolveForm"
        :rules="resolveFormRules"
        label-width="100px"
      >
        <el-form-item label="处理方式" prop="resolution">
          <el-radio-group v-model="resolveForm.resolution">
            <el-radio label="resolved">标记为已解决</el-radio>
            <el-radio label="ignored">忽略差异</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明" prop="note">
          <el-input v-model="resolveForm.note" type="textarea" :rows="4" placeholder="请输入处理说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resolveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleResolveSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Refresh, Search, Calendar, SuccessFilled, Clock, Warning } from '@element-plus/icons-vue'
import { reconciliationApi } from '@/api/payment'
import type { ReconciliationRecord, ReconciliationDifference } from '@/types/payment'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const triggerDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const resolveDialogVisible = ref(false)
const reconciliationList = ref<ReconciliationRecord[]>([])
const differences = ref<ReconciliationDifference[]>([])
const selectedReconciliation = ref<ReconciliationRecord | null>(null)
const selectedDifference = ref<ReconciliationDifference | null>(null)

// 统计数据
const stats = reactive({
  todayCount: 1250,
  todayAmount: 2500000,
  successCount: 1180,
  successRate: 94.4,
  pendingCount: 15,
  differenceCount: 8,
  differenceAmount: 12580
})

// 搜索表单
const searchForm = reactive({
  date: '',
  paymentChannel: '',
  status: ''
})

const dateRange = ref<[string, string] | null>(null)

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 手动对账表单
const triggerForm = reactive({
  date: '',
  paymentChannel: ''
})

// 处理差异表单
const resolveForm = reactive({
  resolution: 'resolved' as 'resolved' | 'ignored',
  note: ''
})

// 表单引用
const triggerFormRef = ref<FormInstance>()
const resolveFormRef = ref<FormInstance>()

// 表单验证规则
const triggerFormRules: FormRules = {
  date: [
    { required: true, message: '请选择对账日期', trigger: 'change' }
  ],
  paymentChannel: [
    { required: true, message: '请选择支付渠道', trigger: 'change' }
  ]
}

const resolveFormRules: FormRules = {
  resolution: [
    { required: true, message: '请选择处理方式', trigger: 'change' }
  ],
  note: [
    { required: true, message: '请输入处理说明', trigger: 'blur' }
  ]
}

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    import('@/api/mock/payment').then(({ mockReconciliationRecords }) => {
      let filteredData = mockReconciliationRecords

      // 应用搜索过滤
      if (searchForm.date) {
        filteredData = filteredData.filter(item => item.date === searchForm.date)
      }
      if (searchForm.paymentChannel) {
        filteredData = filteredData.filter(item => item.paymentChannel === searchForm.paymentChannel)
      }
      if (searchForm.status) {
        filteredData = filteredData.filter(item => item.status === searchForm.status)
      }

      // 日期范围过滤
      if (dateRange.value) {
        const [startDate, endDate] = dateRange.value
        filteredData = filteredData.filter(item => item.date >= startDate && item.date <= endDate)
      }

      // 分页处理
      const startIndex = (pagination.page - 1) * pagination.pageSize
      const endIndex = startIndex + pagination.pageSize
      reconciliationList.value = filteredData.slice(startIndex, endIndex)
      pagination.total = filteredData.length
    })
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const loadDifferences = async (reconciliationId: string) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))

    import('@/api/mock/payment').then(({ mockReconciliationDifferences }) => {
      differences.value = mockReconciliationDifferences.filter(item => item.reconciliationId === reconciliationId)
    })
  } catch (error) {
    ElMessage.error('加载差异记录失败')
    console.error('加载差异记录失败:', error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    date: '',
    paymentChannel: '',
    status: ''
  })
  dateRange.value = null
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

const handleTriggerReconciliation = () => {
  Object.assign(triggerForm, {
    date: '',
    paymentChannel: ''
  })
  triggerDialogVisible.value = true
}

const handleTriggerSubmit = async () => {
  if (!triggerFormRef.value) return

  try {
    await triggerFormRef.value.validate()
    submitting.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    ElMessage.success('对账任务已启动')
    triggerDialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('触发对账失败')
      console.error('触发对账失败:', error)
    }
  } finally {
    submitting.value = false
  }
}

const handleView = async (row: ReconciliationRecord) => {
  selectedReconciliation.value = row
  await loadDifferences(row.id)
  detailDialogVisible.value = true
}

const handleDownloadReport = (row: ReconciliationRecord) => {
  ElMessage.info(`下载对账报告: ${row.reportPath}`)
}

const handleProcessReconciliation = (row: ReconciliationRecord) => {
  handleView(row)
}

const handleRetryReconciliation = async (row: ReconciliationRecord) => {
  try {
    ElMessage.info('正在重试对账...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    ElMessage.success('重试对账成功')
    loadData()
  } catch (error) {
    ElMessage.error('重试对账失败')
    console.error('重试对账失败:', error)
  }
}

const handleResolveDifference = (row: ReconciliationDifference) => {
  selectedDifference.value = row
  Object.assign(resolveForm, {
    resolution: 'resolved',
    note: ''
  })
  resolveDialogVisible.value = true
}

const handleResolveSubmit = async () => {
  if (!resolveFormRef.value || !selectedDifference.value) return

  try {
    await resolveFormRef.value.validate()
    submitting.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('差异处理成功')
    resolveDialogVisible.value = false

    // 重新加载差异列表
    if (selectedReconciliation.value) {
      await loadDifferences(selectedReconciliation.value.id)
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('差异处理失败')
      console.error('差异处理失败:', error)
    }
  } finally {
    submitting.value = false
  }
}

const handleViewDifference = (row: ReconciliationDifference) => {
  ElMessage.info(`查看差异详情: ${row.orderId}`)
}

// 辅助方法
const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待对账',
    processing: '对账中',
    completed: '已完成',
    failed: '失败'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    failed: 'danger'
  }
  return colorMap[status] || ''
}

const getDifferenceTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    missing: '缺失记录',
    amount_mismatch: '金额不匹配',
    status_mismatch: '状态不一致',
    duplicate: '重复记录'
  }
  return typeMap[type] || type
}

const getDifferenceTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    missing: 'danger',
    amount_mismatch: 'warning',
    status_mismatch: 'primary',
    duplicate: 'info'
  }
  return colorMap[type] || ''
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
.reconciliation-management {
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

.overview-card.today {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.overview-card.success {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.overview-card.pending {
  background: linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%);
}

.overview-card.difference {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
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

.table-section {
  margin-bottom: 20px;
}

.table-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.count-number {
  color: #409eff;
  font-weight: bold;
}

.amount-number {
  color: #67c23a;
  font-weight: bold;
}

.success-amount {
  color: #67c23a;
  font-weight: bold;
}

.failed-count {
  color: #f56c6c;
  font-weight: bold;
}

.failed-amount {
  color: #f56c6c;
  font-weight: bold;
}

.refund-amount {
  color: #e6a23c;
  font-weight: bold;
}

.fee-amount {
  color: #909399;
  font-weight: bold;
}

.actual-amount {
  color: #409eff;
  font-weight: bold;
}

.difference-amount {
  color: #f56c6c;
  font-weight: bold;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.reconciliation-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.stats-section {
  margin-bottom: 20px;
}

.stats-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stat-card {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-desc {
  font-size: 12px;
  color: #909399;
}

.differences-section {
  margin-top: 20px;
}

.differences-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-descriptions__body) {
  background-color: #fafafa;
}
</style>
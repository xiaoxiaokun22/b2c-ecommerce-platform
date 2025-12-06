<template>
  <div class="refund-management">
    <div class="page-header">
      <div class="header-content">
        <h2>退款管理</h2>
        <p>处理用户的退款申请和退款记录管理</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreateRefund">
          <el-icon><Plus /></el-icon>
          创建退款
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="overview-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="overview-card pending">
            <div class="card-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">待处理退款</div>
              <div class="card-value">{{ stats.pendingCount }}</div>
              <div class="card-desc">退款金额: ¥{{ stats.pendingAmount.toFixed(2) }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card processing">
            <div class="card-icon">
              <el-icon><Loading /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">处理中退款</div>
              <div class="card-value">{{ stats.processingCount }}</div>
              <div class="card-desc">退款金额: ¥{{ stats.processingAmount.toFixed(2) }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card success">
            <div class="card-icon">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">已完成退款</div>
              <div class="card-value">{{ stats.successCount }}</div>
              <div class="card-desc">退款金额: ¥{{ stats.successAmount.toFixed(2) }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card failed">
            <div class="card-icon">
              <el-icon><CircleCloseFilled /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">失败退款</div>
              <div class="card-value">{{ stats.failedCount }}</div>
              <div class="card-desc">退款金额: ¥{{ stats.failedAmount.toFixed(2) }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="退款状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="success" />
            <el-option label="失败" value="failed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="退款类型">
          <el-select v-model="searchForm.refundType" placeholder="请选择" clearable style="width: 120px">
            <el-option label="全额退款" value="full" />
            <el-option label="部分退款" value="partial" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
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
        <el-form-item label="申请人">
          <el-input v-model="searchForm.applyUserName" placeholder="请输入申请人" clearable style="width: 150px" />
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
        :data="refundList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="退款编号" width="150" />
        <el-table-column prop="orderId" label="订单号" width="150" />
        <el-table-column prop="originalAmount" label="原订单金额" width="120">
          <template #default="{ row }">
            ¥{{ row.originalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="refundAmount" label="退款金额" width="120">
          <template #default="{ row }">
            <span class="refund-amount">¥{{ row.refundAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundType" label="退款类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.refundType === 'full' ? 'danger' : 'warning'">
              {{ row.refundType === 'full' ? '全额退款' : '部分退款' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="refundReason" label="退款原因" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="refundMethod" label="退款方式" width="100">
          <template #default="{ row }">
            {{ row.refundMethod === 'original' ? '原路退回' : '手动退款' }}
          </template>
        </el-table-column>
        <el-table-column prop="processorName" label="处理人" width="100" />
        <el-table-column prop="applyUserName" label="申请人" width="100" />
        <el-table-column prop="createdAt" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="processedAt" label="处理时间" width="180">
          <template #default="{ row }">
            {{ row.processedAt ? formatDateTime(row.processedAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="success"
              @click="handleProcess(row, true)"
            >
              同意
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="danger"
              @click="handleProcess(row, false)"
            >
              拒绝
            </el-button>
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small" type="primary">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="upload-proof" v-if="row.status === 'success'">上传退款证明</el-dropdown-item>
                  <el-dropdown-item command="cancel" v-if="row.status === 'pending'">取消退款</el-dropdown-item>
                  <el-dropdown-item command="retry" v-if="row.status === 'failed'">重试退款</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
          @update:current-page="pagination.page = $event"
          @update:page-size="pagination.pageSize = $event"
        />
      </div>
    </div>

    <!-- 创建退款对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建退款"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createFormRules"
        label-width="120px"
      >
        <el-form-item label="订单号" prop="orderId">
          <el-input v-model="createForm.orderId" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="支付单号" prop="paymentId">
          <el-input v-model="createForm.paymentId" placeholder="请输入支付单号" />
        </el-form-item>
        <el-form-item label="退款类型" prop="refundType">
          <el-select v-model="createForm.refundType" placeholder="请选择退款类型" style="width: 100%">
            <el-option label="全额退款" value="full" />
            <el-option label="部分退款" value="partial" />
          </el-select>
        </el-form-item>
        <el-form-item label="退款金额" prop="refundAmount" v-if="createForm.refundType === 'partial'">
          <el-input-number
            v-model="createForm.refundAmount"
            :min="0.01"
            :precision="2"
            placeholder="请输入退款金额"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="退款原因" prop="refundReason">
          <el-input v-model="createForm.refundReason" type="textarea" :rows="3" placeholder="请输入退款原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 退款详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="退款详情"
      width="800px"
      destroy-on-close
    >
      <div v-if="selectedRefund" class="refund-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="退款编号">{{ selectedRefund.id }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ selectedRefund.orderId }}</el-descriptions-item>
          <el-descriptions-item label="支付单号">{{ selectedRefund.paymentId }}</el-descriptions-item>
          <el-descriptions-item label="原订单金额">¥{{ selectedRefund.originalAmount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="退款金额">¥{{ selectedRefund.refundAmount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="退款类型">
            {{ selectedRefund.refundType === 'full' ? '全额退款' : '部分退款' }}
          </el-descriptions-item>
          <el-descriptions-item label="退款原因" :span="2">{{ selectedRefund.refundReason }}</el-descriptions-item>
          <el-descriptions-item label="退款状态">
            <el-tag :type="getStatusColor(selectedRefund.status)">
              {{ getStatusName(selectedRefund.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="退款方式">
            {{ selectedRefund.refundMethod === 'original' ? '原路退回' : '手动退款' }}
          </el-descriptions-item>
          <el-descriptions-item label="处理人">{{ selectedRefund.processorName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ selectedRefund.applyUserName }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ formatDateTime(selectedRefund.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="处理时间">
            {{ selectedRefund.processedAt ? formatDateTime(selectedRefund.processedAt) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="失败原因" v-if="selectedRefund.failureReason">
            {{ selectedRefund.failureReason }}
          </el-descriptions-item>
          <el-descriptions-item label="退款证明" v-if="selectedRefund.refundProof">
            <el-link type="primary" @click="handleViewProof(selectedRefund.refundProof)">查看证明</el-link>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 处理退款对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      :title="processDialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="processFormRef"
        :model="processForm"
        :rules="processFormRules"
        label-width="100px"
      >
        <el-form-item label="处理结果" prop="approved">
          <el-radio-group v-model="processForm.approved">
            <el-radio :label="true">同意退款</el-radio>
            <el-radio :label="false">拒绝退款</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明" prop="processorNote">
          <el-input v-model="processForm.processorNote" type="textarea" :rows="4" placeholder="请输入处理说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleProcessSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElUpload } from 'element-plus'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { Plus, Refresh, Search, Download, Clock, Loading, SuccessFilled, CircleCloseFilled, ArrowDown } from '@element-plus/icons-vue'
import { refundApi, type RefundRecord } from '../../../api/payment'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const createDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const processDialogVisible = ref(false)
const processDialogTitle = ref('')
const refundList = ref<RefundRecord[]>([])
const selectedRefund = ref<RefundRecord | null>(null)

// 统计数据
const stats = reactive({
  pendingCount: 8,
  pendingAmount: 12580,
  processingCount: 5,
  processingAmount: 8960,
  successCount: 42,
  successAmount: 78960,
  failedCount: 3,
  failedAmount: 4560
})

// 搜索表单
const searchForm = reactive({
  orderId: '',
  status: '',
  refundType: '',
  applyUserName: ''
})

const dateRange = ref<[string, string] | null>(null)

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 创建退款表单
const createForm = reactive({
  orderId: '',
  paymentId: '',
  refundType: 'full' as 'full' | 'partial',
  refundAmount: 0,
  refundReason: ''
})

// 处理退款表单
const processForm = reactive({
  approved: true,
  processorNote: ''
})

// 表单引用
const createFormRef = ref<FormInstance>()
const processFormRef = ref<FormInstance>()

// 表单验证规则
const createFormRules: FormRules = {
  orderId: [
    { required: true, message: '请输入订单号', trigger: 'blur' }
  ],
  paymentId: [
    { required: true, message: '请输入支付单号', trigger: 'blur' }
  ],
  refundType: [
    { required: true, message: '请选择退款类型', trigger: 'change' }
  ],
  refundAmount: [
    { required: true, message: '请输入退款金额', trigger: 'blur' }
  ],
  refundReason: [
    { required: true, message: '请输入退款原因', trigger: 'blur' }
  ]
}

const processFormRules: FormRules = {
  approved: [
    { required: true, message: '请选择处理结果', trigger: 'change' }
  ],
  processorNote: [
    { required: true, message: '请输入处理说明', trigger: 'blur' }
  ]
}

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    import('../../../api/mock/payment').then(({ mockRefundRecords }) => {
      let filteredData = mockRefundRecords

      // 应用搜索过滤
      if (searchForm.orderId) {
        filteredData = filteredData.filter(item => item.orderId.includes(searchForm.orderId))
      }
      if (searchForm.status) {
        filteredData = filteredData.filter(item => item.status === searchForm.status)
      }
      if (searchForm.refundType) {
        filteredData = filteredData.filter(item => item.refundType === searchForm.refundType)
      }
      if (searchForm.applyUserName) {
        filteredData = filteredData.filter(item => item.applyUserName.includes(searchForm.applyUserName))
      }

      // 日期范围过滤
      if (dateRange.value) {
        const [startDate, endDate] = dateRange.value
        filteredData = filteredData.filter(item => {
          const createdAt = new Date(item.createdAt).toISOString().split('T')[0]
          return createdAt >= startDate && createdAt <= endDate
        })
      }

      // 分页处理
      const startIndex = (pagination.page - 1) * pagination.pageSize
      const endIndex = startIndex + pagination.pageSize
      refundList.value = filteredData.slice(startIndex, endIndex)
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
    orderId: '',
    status: '',
    refundType: '',
    applyUserName: ''
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

const handleCreateRefund = () => {
  Object.assign(createForm, {
    orderId: '',
    paymentId: '',
    refundType: 'full',
    refundAmount: 0,
    refundReason: ''
  })
  createDialogVisible.value = true
}

const handleCreateSubmit = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    submitting.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('创建退款成功')
    createDialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('创建退款失败')
      console.error('创建退款失败:', error)
    }
  } finally {
    submitting.value = false
  }
}

const handleView = (row: RefundRecord) => {
  selectedRefund.value = row
  detailDialogVisible.value = true
}

const handleProcess = (row: RefundRecord, approved: boolean) => {
  processDialogTitle.value = approved ? '同意退款' : '拒绝退款'
  Object.assign(processForm, {
    approved,
    processorNote: ''
  })
  selectedRefund.value = row
  processDialogVisible.value = true
}

const handleProcessSubmit = async () => {
  if (!processFormRef.value || !selectedRefund.value) return

  try {
    await processFormRef.value.validate()
    submitting.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    const actionText = processForm.approved ? '同意' : '拒绝'
    ElMessage.success(`${actionText}退款成功`)
    processDialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('处理退款失败')
      console.error('处理退款失败:', error)
    }
  } finally {
    submitting.value = false
  }
}

const handleCommand = async (command: string, row: RefundRecord) => {
  switch (command) {
    case 'upload-proof':
      await handleUploadProof(row)
      break
    case 'cancel':
      await handleCancelRefund(row)
      break
    case 'retry':
      await handleRetryRefund(row)
      break
  }
}

const handleUploadProof = async (row: RefundRecord) => {
  ElMessage.info('上传退款证明功能')
}

const handleCancelRefund = async (row: RefundRecord) => {
  try {
    await ElMessageBox.confirm(`确定要取消退款申请"${row.id}"吗？`, '确认取消', {
      type: 'warning'
    })

    // 调用API
    // await refundApi.cancel(row.id, '管理员取消')
    await new Promise(resolve => setTimeout(resolve, 500))

    ElMessage.success('取消退款成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消退款失败')
      console.error('取消退款失败:', error)
    }
  }
}

const handleRetryRefund = async (row: RefundRecord) => {
  try {
    ElMessage.info('正在重试退款...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('重试退款成功')
    loadData()
  } catch (error) {
    ElMessage.error('重试退款失败')
    console.error('重试退款失败:', error)
  }
}

const handleViewProof = (proofPath: string) => {
  ElMessage.info(`查看退款证明: ${proofPath}`)
}

const handleExport = () => {
  ElMessage.info('导出退款数据功能')
}

// 辅助方法
const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    success: '已完成',
    failed: '失败',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    success: 'success',
    failed: 'danger',
    cancelled: 'info'
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
.refund-management {
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

.overview-card.pending {
  background: linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%);
}

.overview-card.processing {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.overview-card.success {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.overview-card.failed {
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

.refund-amount {
  color: #f56c6c;
  font-weight: bold;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.refund-detail {
  padding: 20px 0;
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
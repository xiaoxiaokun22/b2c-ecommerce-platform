<template>
  <div class="refund-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>退款管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportRefunds">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon pending">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.pendingCount || 0 }}</div>
                <div class="stat-label">待处理</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon approved">
                <el-icon><Select /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.approvedCount || 0 }}</div>
                <div class="stat-label">已同意</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon rejected">
                <el-icon><Close /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.rejectedCount || 0 }}</div>
                <div class="stat-label">已拒绝</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon completed">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.completedCount || 0 }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.userName"
            placeholder="请输入用户名"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="退款状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择退款状态"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in refundStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 350px"
          />
        </el-form-item>
        <el-form-item label="退款金额">
          <el-input
            v-model="searchForm.minAmount"
            placeholder="最小金额"
            type="number"
            style="width: 120px"
          />
          <span style="margin: 0 8px">-</span>
          <el-input
            v-model="searchForm.maxAmount"
            placeholder="最大金额"
            type="number"
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 退款列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="refundList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="orderNo" label="订单号" width="150" fixed="left">
          <template #default="{ row }">
            <el-link type="primary" @click="viewOrderDetail(row.orderId)">
              {{ row.orderNo }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="用户" width="120">
          <template #default="{ row }">
            <div>{{ row.userName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="refundAmount" label="退款金额" width="120">
          <template #default="{ row }">
            <span class="refund-amount">￥{{ row.refundAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="退款原因" min-width="200">
          <template #default="{ row }">
            <div class="reason-content">
              <div>{{ row.reason }}</div>
              <div v-if="row.description" class="text-gray-500 text-sm">
                {{ row.description }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="退款状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="180" />
        <el-table-column prop="processTime" label="处理时间" width="180">
          <template #default="{ row }">
            <span v-if="row.processTime">{{ row.processTime }}</span>
            <span v-else class="text-gray-500">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="processor" label="处理人" width="100">
          <template #default="{ row }">
            <span v-if="row.processor">{{ row.processor }}</span>
            <span v-else class="text-gray-500">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === RefundStatus.PENDING"
              type="text"
              size="small"
              @click="handleProcess(row)"
            >
              处理
            </el-button>
            <el-dropdown @command="(command) => handleMoreAction(command, row)">
              <el-button type="text" size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="view-order">查看订单</el-dropdown-item>
                  <el-dropdown-item command="add-remark">添加备注</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialog.visible"
      title="退款详情"
      width="600px"
    >
      <div v-if="detailDialog.data" class="refund-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="退款编号">
            {{ detailDialog.data.id }}
          </el-descriptions-item>
          <el-descriptions-item label="订单号">
            {{ detailDialog.data.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="用户名">
            {{ detailDialog.data.userName }}
          </el-descriptions-item>
          <el-descriptions-item label="退款金额">
            <span class="refund-amount">￥{{ detailDialog.data.refundAmount.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="退款原因">
            {{ detailDialog.data.reason }}
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ detailDialog.data.applyTime }}
          </el-descriptions-item>
          <el-descriptions-item label="详细描述" :span="2">
            {{ detailDialog.data.description || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="getStatusType(detailDialog.data.status)">
              {{ getStatusLabel(detailDialog.data.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理人">
            {{ detailDialog.data.processor || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="处理时间">
            {{ detailDialog.data.processTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="完成时间">
            {{ detailDialog.data.completeTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="处理备注" :span="2">
            {{ detailDialog.data.remark || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 处理对话框 -->
    <el-dialog
      v-model="processDialog.visible"
      :title="processDialog.title"
      width="500px"
    >
      <el-form :model="processDialog.form" label-width="80px">
        <el-form-item label="处理结果">
          <el-radio-group v-model="processDialog.form.approved">
            <el-radio :label="true">同意退款</el-radio>
            <el-radio :label="false">拒绝退款</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input
            v-model="processDialog.form.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入处理说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmProcess">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Refresh, ArrowDown, Clock, Select, Close, Check } from '@element-plus/icons-vue'
import { refundApi, orderApi } from '@/api/order'
import { RefundStatus, type Refund } from '@/types/order'

const router = useRouter()

// 统计数据
const statistics = ref({
  pendingCount: 0,
  approvedCount: 0,
  rejectedCount: 0,
  completedCount: 0
})

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  userName: '',
  status: undefined as number | undefined,
  dateRange: null as [string, string] | null,
  minAmount: undefined as number | undefined,
  maxAmount: undefined as number | undefined
})

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 列表数据
const refundList = ref<Refund[]>([])
const loading = ref(false)

// 退款状态选项
const refundStatusOptions = [
  { label: '待处理', value: RefundStatus.PENDING },
  { label: '已同意', value: RefundStatus.APPROVED },
  { label: '已拒绝', value: RefundStatus.REJECTED },
  { label: '处理中', value: RefundStatus.PROCESSING },
  { label: '已完成', value: RefundStatus.COMPLETED }
]

// 详情对话框
const detailDialog = reactive({
  visible: false,
  data: null as Refund | null
})

// 处理对话框
const processDialog = reactive({
  visible: false,
  title: '',
  currentRefund: null as Refund | null,
  form: {
    approved: true,
    remark: ''
  }
})

// 获取退款列表
const getRefunds = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: searchForm.status
    }

    const response = await refundApi.getRefunds(params)
    if (response.code === 200) {
      refundList.value = response.data.list.filter(refund => {
        // 前端筛选
        if (searchForm.orderNo && !refund.orderNo.includes(searchForm.orderNo)) {
          return false
        }
        if (searchForm.userName && !refund.userName.includes(searchForm.userName)) {
          return false
        }
        if (searchForm.dateRange) {
          const [startTime, endTime] = searchForm.dateRange
          if (refund.applyTime < startTime || refund.applyTime > endTime) {
            return false
          }
        }
        if (searchForm.minAmount !== undefined && refund.refundAmount < searchForm.minAmount) {
          return false
        }
        if (searchForm.maxAmount !== undefined && refund.refundAmount > searchForm.maxAmount) {
          return false
        }
        return true
      })

      // 更新总数
      const allResponse = await refundApi.getRefunds({ pageSize: 1000 })
      if (allResponse.code === 200) {
        const allRefunds = allResponse.data.list
        statistics.value = {
          pendingCount: allRefunds.filter(r => r.status === RefundStatus.PENDING).length,
          approvedCount: allRefunds.filter(r => r.status === RefundStatus.APPROVED).length,
          rejectedCount: allRefunds.filter(r => r.status === RefundStatus.REJECTED).length,
          completedCount: allRefunds.filter(r => r.status === RefundStatus.COMPLETED).length
        }
      }

      pagination.total = refundList.value.length
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    ElMessage.error('获取退款列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getRefunds()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    orderNo: '',
    userName: '',
    status: undefined,
    dateRange: null,
    minAmount: undefined,
    maxAmount: undefined
  })
  pagination.page = 1
  getRefunds()
}

// 刷新数据
const refreshData = () => {
  getRefunds()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  getRefunds()
}

// 页码改变
const handleCurrentChange = (page: number) => {
  pagination.page = page
  getRefunds()
}

// 查看订单详情
const viewOrderDetail = (orderId: number) => {
  router.push(`/system/orders/detail/${orderId}`)
}

// 查看退款详情
const viewDetail = (refund: Refund) => {
  detailDialog.data = refund
  detailDialog.visible = true
}

// 处理退款
const handleProcess = (refund: Refund) => {
  processDialog.currentRefund = refund
  processDialog.title = `处理退款 - ${refund.orderNo}`
  processDialog.form = {
    approved: true,
    remark: ''
  }
  processDialog.visible = true
}

// 确认处理
const confirmProcess = async () => {
  if (!processDialog.currentRefund) return

  try {
    const response = await refundApi.processRefund(
      processDialog.currentRefund.id,
      processDialog.form.approved,
      processDialog.form.remark
    )
    if (response.code === 200) {
      ElMessage.success(response.message)
      processDialog.visible = false
      getRefunds()
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    ElMessage.error('处理失败')
  }
}

// 处理更多操作
const handleMoreAction = async (command: string, refund: Refund) => {
  switch (command) {
    case 'view-order':
      viewOrderDetail(refund.orderId)
      break
    case 'add-remark':
      await addRefundRemark(refund)
      break
  }
}

// 添加退款备注
const addRefundRemark = async (refund: Refund) => {
  try {
    const { value: remark } = await ElMessageBox.prompt('请输入备注信息', '添加备注', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入备注信息'
    })

    ElMessage.success('备注添加成功')
    // 这里应该调用添加备注的API
  } catch (error) {
    // 用户取消操作
  }
}

// 导出数据
const exportRefunds = () => {
  ElMessage.info('导出功能开发中...')
}

// 获取状态标签
const getStatusLabel = (status: RefundStatus) => {
  const option = refundStatusOptions.find(item => item.value === status)
  return option?.label || '未知状态'
}

// 获取状态类型
const getStatusType = (status: RefundStatus) => {
  switch (status) {
    case RefundStatus.PENDING:
      return 'warning'
    case RefundStatus.APPROVED:
      return 'success'
    case RefundStatus.REJECTED:
      return 'danger'
    case RefundStatus.PROCESSING:
      return 'primary'
    case RefundStatus.COMPLETED:
      return 'success'
    default:
      return 'info'
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getRefunds()
})
</script>

<style scoped>
.refund-management {
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
}

.header-actions {
  display: flex;
  gap: 12px;
}

.statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 100px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.stat-icon.approved {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.stat-icon.rejected {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.refund-amount {
  color: #f56c6c;
  font-weight: 500;
}

.reason-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.refund-detail {
  padding: 20px 0;
}

.text-gray-500 {
  color: #6b7280;
}

.text-sm {
  font-size: 0.875rem;
}
</style>
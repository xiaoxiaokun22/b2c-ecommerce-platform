<template>
  <div class="after-sale-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>售后服务管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportAfterSales">
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
              <div class="stat-icon refund">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.refundCount || 0 }}</div>
                <div class="stat-label">仅退款</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon return">
                <el-icon><RefreshLeft /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.returnCount || 0 }}</div>
                <div class="stat-label">退货退款</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon exchange">
                <el-icon><Switch /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.exchangeCount || 0 }}</div>
                <div class="stat-label">换货</div>
              </div>
            </div>
          </el-card>
        </el-col>
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
        <el-form-item label="服务类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择服务类型"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in afterSaleTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择处理状态"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in statusOptions"
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
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 售后服务列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="afterSaleList"
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
        <el-table-column prop="type" label="服务类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="申请原因" min-width="200">
          <template #default="{ row }">
            <div class="reason-content">
              <div>{{ row.reason }}</div>
              <div v-if="row.description" class="text-gray-500 text-sm">
                {{ row.description }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="refundAmount" label="退款金额" width="120">
          <template #default="{ row }">
            <span v-if="row.refundAmount" class="refund-amount">
              ￥{{ row.refundAmount.toFixed(2) }}
            </span>
            <span v-else class="text-gray-500">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="images" label="凭证图片" width="100">
          <template #default="{ row }">
            <el-button
              v-if="row.images && row.images.length > 0"
              type="text"
              size="small"
              @click="viewImages(row.images)"
            >
              查看图片({{ row.images.length }})
            </el-button>
            <span v-else class="text-gray-500">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="处理状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="180" />
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
      title="售后服务详情"
      width="700px"
    >
      <div v-if="detailDialog.data" class="after-sale-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="售后编号">
            {{ detailDialog.data.id }}
          </el-descriptions-item>
          <el-descriptions-item label="订单号">
            {{ detailDialog.data.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="用户名">
            {{ detailDialog.data.userName }}
          </el-descriptions-item>
          <el-descriptions-item label="服务类型">
            <el-tag :type="getTypeTagType(detailDialog.data.type)">
              {{ getTypeLabel(detailDialog.data.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请原因">
            {{ detailDialog.data.reason }}
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ detailDialog.data.applyTime }}
          </el-descriptions-item>
          <el-descriptions-item label="详细描述" :span="2">
            {{ detailDialog.data.description || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="退款金额">
            <span v-if="detailDialog.data.refundAmount" class="refund-amount">
              ￥{{ detailDialog.data.refundAmount.toFixed(2) }}
            </span>
            <span v-else>-</span>
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

        <!-- 凭证图片 -->
        <div v-if="detailDialog.data.images && detailDialog.data.images.length > 0" class="images-section">
          <h4>凭证图片</h4>
          <div class="images-grid">
            <el-image
              v-for="(image, index) in detailDialog.data.images"
              :key="index"
              :src="image"
              style="width: 100px; height: 100px"
              fit="cover"
              :preview-src-list="detailDialog.data.images"
              :initial-index="index"
            />
          </div>
        </div>
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
            <el-radio :label="true">同意</el-radio>
            <el-radio :label="false">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="退款金额" v-if="processDialog.currentAfterSale?.type !== AfterSaleType.EXCHANGE">
          <el-input-number
            v-model="processDialog.form.refundAmount"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入退款金额"
          />
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

    <!-- 图片预览对话框 -->
    <el-dialog v-model="imageDialog.visible" title="凭证图片" width="800px">
      <div class="image-preview">
        <el-image
          v-for="(image, index) in imageDialog.images"
          :key="index"
          :src="image"
          style="width: 200px; height: 200px; margin: 10px"
          fit="cover"
          :preview-src-list="imageDialog.images"
          :initial-index="index"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download, Refresh, ArrowDown, Clock, Money,
  RefreshLeft, Switch
} from '@element-plus/icons-vue'
import { afterSaleApi, orderApi } from '@/api/order'
import {
  RefundStatus, AfterSaleType, type AfterSale
} from '@/types/order'

const router = useRouter()

// 统计数据
const statistics = ref({
  refundCount: 0,
  returnCount: 0,
  exchangeCount: 0,
  pendingCount: 0
})

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  userName: '',
  type: undefined as number | undefined,
  status: undefined as number | undefined,
  dateRange: null as [string, string] | null
})

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 列表数据
const afterSaleList = ref<AfterSale[]>([])
const loading = ref(false)

// 售后服务类型选项
const afterSaleTypeOptions = [
  { label: '仅退款', value: AfterSaleType.REFUND },
  { label: '退货退款', value: AfterSaleType.RETURN },
  { label: '换货', value: AfterSaleType.EXCHANGE }
]

// 状态选项
const statusOptions = [
  { label: '待处理', value: RefundStatus.PENDING },
  { label: '已同意', value: RefundStatus.APPROVED },
  { label: '已拒绝', value: RefundStatus.REJECTED },
  { label: '处理中', value: RefundStatus.PROCESSING },
  { label: '已完成', value: RefundStatus.COMPLETED }
]

// 详情对话框
const detailDialog = reactive({
  visible: false,
  data: null as AfterSale | null
})

// 处理对话框
const processDialog = reactive({
  visible: false,
  title: '',
  currentAfterSale: null as AfterSale | null,
  form: {
    approved: true,
    refundAmount: 0,
    remark: ''
  }
})

// 图片预览对话框
const imageDialog = reactive({
  visible: false,
  images: [] as string[]
})

// 获取售后服务列表
const getAfterSales = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      type: searchForm.type,
      status: searchForm.status
    }

    const response = await afterSaleApi.getAfterSales(params)
    if (response.code === 200) {
      afterSaleList.value = response.data.list.filter(afterSale => {
        // 前端筛选
        if (searchForm.orderNo && !afterSale.orderNo.includes(searchForm.orderNo)) {
          return false
        }
        if (searchForm.userName && !afterSale.userName.includes(searchForm.userName)) {
          return false
        }
        if (searchForm.dateRange) {
          const [startTime, endTime] = searchForm.dateRange
          if (afterSale.applyTime < startTime || afterSale.applyTime > endTime) {
            return false
          }
        }
        return true
      })

      // 更新统计数据
      const allResponse = await afterSaleApi.getAfterSales({ pageSize: 1000 })
      if (allResponse.code === 200) {
        const allAfterSales = allResponse.data.list
        statistics.value = {
          refundCount: allAfterSales.filter(a => a.type === AfterSaleType.REFUND).length,
          returnCount: allAfterSales.filter(a => a.type === AfterSaleType.RETURN).length,
          exchangeCount: allAfterSales.filter(a => a.type === AfterSaleType.EXCHANGE).length,
          pendingCount: allAfterSales.filter(a => a.status === RefundStatus.PENDING).length
        }
      }

      pagination.total = afterSaleList.value.length
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    ElMessage.error('获取售后服务列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getAfterSales()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    orderNo: '',
    userName: '',
    type: undefined,
    status: undefined,
    dateRange: null
  })
  pagination.page = 1
  getAfterSales()
}

// 刷新数据
const refreshData = () => {
  getAfterSales()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  getAfterSales()
}

// 页码改变
const handleCurrentChange = (page: number) => {
  pagination.page = page
  getAfterSales()
}

// 查看订单详情
const viewOrderDetail = (orderId: number) => {
  router.push(`/system/orders/detail/${orderId}`)
}

// 查看售后服务详情
const viewDetail = (afterSale: AfterSale) => {
  detailDialog.data = afterSale
  detailDialog.visible = true
}

// 查看图片
const viewImages = (images: string[]) => {
  imageDialog.images = images
  imageDialog.visible = true
}

// 处理售后服务
const handleProcess = (afterSale: AfterSale) => {
  processDialog.currentAfterSale = afterSale
  processDialog.title = `处理售后服务 - ${afterSale.orderNo}`
  processDialog.form = {
    approved: true,
    refundAmount: afterSale.refundAmount || 0,
    remark: ''
  }
  processDialog.visible = true
}

// 确认处理
const confirmProcess = async () => {
  if (!processDialog.currentAfterSale) return

  try {
    const response = await afterSaleApi.processAfterSale(
      processDialog.currentAfterSale.id,
      processDialog.form.approved,
      processDialog.form.remark
    )
    if (response.code === 200) {
      ElMessage.success(response.message)
      processDialog.visible = false
      getAfterSales()
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    ElMessage.error('处理失败')
  }
}

// 处理更多操作
const handleMoreAction = async (command: string, afterSale: AfterSale) => {
  switch (command) {
    case 'view-order':
      viewOrderDetail(afterSale.orderId)
      break
    case 'add-remark':
      await addAfterSaleRemark(afterSale)
      break
  }
}

// 添加售后服务备注
const addAfterSaleRemark = async (afterSale: AfterSale) => {
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
const exportAfterSales = () => {
  ElMessage.info('导出功能开发中...')
}

// 获取服务类型标签
const getTypeLabel = (type: AfterSaleType) => {
  const option = afterSaleTypeOptions.find(item => item.value === type)
  return option?.label || '未知类型'
}

// 获取服务类型标签样式
const getTypeTagType = (type: AfterSaleType) => {
  switch (type) {
    case AfterSaleType.REFUND:
      return 'warning'
    case AfterSaleType.RETURN:
      return 'danger'
    case AfterSaleType.EXCHANGE:
      return 'primary'
    default:
      return 'info'
  }
}

// 获取状态标签
const getStatusLabel = (status: RefundStatus) => {
  const option = statusOptions.find(item => item.value === status)
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
  getAfterSales()
})
</script>

<style scoped>
.after-sale-management {
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

.stat-icon.refund {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.stat-icon.return {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.stat-icon.exchange {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
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

.reason-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.refund-amount {
  color: #f56c6c;
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.after-sale-detail {
  padding: 20px 0;
}

.images-section {
  margin-top: 20px;
}

.images-section h4 {
  margin-bottom: 12px;
  color: #303133;
}

.images-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.text-gray-500 {
  color: #6b7280;
}

.text-sm {
  font-size: 0.875rem;
}
</style>
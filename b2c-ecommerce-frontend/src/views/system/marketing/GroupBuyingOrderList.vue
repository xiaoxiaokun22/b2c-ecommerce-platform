<template>
  <div class="group-buying-order-list">
    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单编号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单编号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="待付款" value="pending" />
            <el-option label="已付款" value="paid" />
            <el-option label="已成团" value="completed" />
            <el-option label="已退款" value="refunded" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column label="订单信息" min-width="200">
          <template #default="{ row }">
            <div class="order-info">
              <div class="order-no">{{ row.orderNo }}</div>
              <div class="order-time">{{ row.createTime }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="团购信息" min-width="200">
          <template #default="{ row }">
            <div class="group-info">
              <div class="group-id">T{{ row.groupId.toString().padStart(6, '0') }}</div>
              <div class="group-status">{{ getGroupStatusText(row.groupStatus) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" width="150">
          <template #default="{ row }">
            <div class="user-info">
              <div>{{ row.userName }}</div>
              <div class="user-phone">{{ row.userPhone }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" min-width="250">
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-name">{{ row.productName }}</div>
              <div class="price-info">
                <span class="original-price">¥{{ row.originalPrice }}</span>
                <span class="group-price">¥{{ row.groupPrice }}</span>
                <span class="quantity">x{{ row.quantity }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单金额" width="150">
          <template #default="{ row }">
            <div class="amount-info">
              <div class="total-amount">¥{{ row.totalAmount }}</div>
              <div class="discount">优惠¥{{ row.discountAmount }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button v-if="row.status === 'paid'" type="success" size="small" @click="handleConfirmRefund(row)">
              退款
            </el-button>
            <el-button v-if="row.status === 'pending'" type="danger" size="small" @click="handleCancel(row)">
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshLeft } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'

// Props
interface Props {
  groupBuyingActivity?: any
}
const props = defineProps<Props>()

// Route
const route = useRoute()
const activityId = ref(route.params.id as string)
const groupId = ref(route.params.groupId as string)

// 响应式数据
const loading = ref(false)
const tableData = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  dateRange: [],
  status: ''
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 模拟订单数据
const mockOrders = ref<any[]>([
  {
    id: 1,
    orderNo: 'ORD20240110001',
    createTime: '2024-01-10 10:35:00',
    groupId: 1,
    groupStatus: 'completed',
    userName: '张三',
    userPhone: '138****1234',
    productName: '小米空气净化器 Pro H',
    originalPrice: 1499,
    groupPrice: 999,
    quantity: 1,
    totalAmount: 999,
    discountAmount: 500,
    status: 'completed'
  },
  {
    id: 2,
    orderNo: 'ORD20240110002',
    createTime: '2024-01-10 11:20:00',
    groupId: 1,
    groupStatus: 'completed',
    userName: '李四',
    userPhone: '139****5678',
    productName: '小米空气净化器 Pro H',
    originalPrice: 1499,
    groupPrice: 999,
    quantity: 2,
    totalAmount: 1998,
    discountAmount: 1000,
    status: 'completed'
  },
  {
    id: 3,
    orderNo: 'ORD20240111001',
    createTime: '2024-01-11 09:30:00',
    groupId: 2,
    groupStatus: 'pending',
    userName: '王五',
    userPhone: '137****9012',
    productName: '小米空气净化器 Pro H',
    originalPrice: 1499,
    groupPrice: 999,
    quantity: 1,
    totalAmount: 999,
    discountAmount: 500,
    status: 'paid'
  },
  {
    id: 4,
    orderNo: 'ORD20240111002',
    createTime: '2024-01-11 10:15:00',
    groupId: 2,
    groupStatus: 'pending',
    userName: '赵六',
    userPhone: '136****3456',
    productName: '小米空气净化器 Pro H',
    originalPrice: 1499,
    groupPrice: 999,
    quantity: 1,
    totalAmount: 999,
    discountAmount: 500,
    status: 'paid'
  },
  {
    id: 5,
    orderNo: 'ORD20240112001',
    createTime: '2024-01-12 11:45:00',
    groupId: 4,
    groupStatus: 'pending',
    userName: '孙七',
    userPhone: '135****7890',
    productName: '小米空气净化器 Pro H',
    originalPrice: 1499,
    groupPrice: 999,
    quantity: 1,
    totalAmount: 999,
    discountAmount: 500,
    status: 'pending'
  },
  {
    id: 6,
    orderNo: 'ORD20240112002',
    createTime: '2024-01-12 15:30:00',
    groupId: 5,
    groupStatus: 'failed',
    userName: '周八',
    userPhone: '134****2345',
    productName: '小米空气净化器 Pro H',
    originalPrice: 1499,
    groupPrice: 999,
    quantity: 1,
    totalAmount: 999,
    discountAmount: 500,
    status: 'refunded'
  },
  {
    id: 7,
    orderNo: 'ORD20240113001',
    createTime: '2024-01-13 08:20:00',
    groupId: 6,
    groupStatus: 'pending',
    userName: '吴九',
    userPhone: '133****6789',
    productName: '小米空气净化器 Pro H',
    originalPrice: 1499,
    groupPrice: 999,
    quantity: 1,
    totalAmount: 999,
    discountAmount: 500,
    status: 'paid'
  },
  {
    id: 8,
    orderNo: 'ORD20240113002',
    createTime: '2024-01-13 14:10:00',
    groupId: 7,
    groupStatus: 'completed',
    userName: '郑十',
    userPhone: '132****0123',
    productName: '小米空气净化器 Pro H',
    originalPrice: 1499,
    groupPrice: 999,
    quantity: 3,
    totalAmount: 2997,
    discountAmount: 1500,
    status: 'completed'
  }
])

// 获取订单状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    paid: 'info',
    completed: 'success',
    refunded: 'danger',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取订单状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待付款',
    paid: '已付款',
    completed: '已成团',
    refunded: '已退款',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 获取团购状态文本
const getGroupStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '拼团中',
    completed: '已成团',
    failed: '已失败'
  }
  return textMap[status] || status
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 筛选数据
    let filteredData = [...mockOrders.value]

    // 根据团购ID和团ID筛选
    if (groupId.value) {
      const group = parseInt(groupId.value as string)
      filteredData = filteredData.filter(item => item.groupId === group)
    }

    if (searchForm.orderNo) {
      filteredData = filteredData.filter(item =>
        item.orderNo.toLowerCase().includes(searchForm.orderNo.toLowerCase())
      )
    }

    if (searchForm.status) {
      filteredData = filteredData.filter(item => item.status === searchForm.status)
    }

    if (searchForm.dateRange && Array.isArray(searchForm.dateRange) && searchForm.dateRange.length === 2) {
      const [startDate, endDate] = searchForm.dateRange
      filteredData = filteredData.filter(item => {
        return item.createTime >= startDate && item.createTime <= endDate
      })
    }

    // 分页
    pagination.total = filteredData.length
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = filteredData.slice(start, end)

  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key as keyof typeof searchForm] = ''
  })
  pagination.current = 1
  loadData()
}

// 查看详情
const handleViewDetail = (order: any) => {
  ElMessage.info(`查看订单详情: ${order.orderNo}`)
}

// 确认退款
const handleConfirmRefund = async (order: any) => {
  try {
    await ElMessageBox.confirm(
      `确认对订单 ${order.orderNo} 进行退款吗？`,
      '退款确认',
      {
        type: 'warning'
      }
    )
    ElMessage.success('退款操作已提交')
  } catch {
    // 用户取消
  }
}

// 取消订单
const handleCancel = async (order: any) => {
  try {
    await ElMessageBox.confirm(
      `确认取消订单 ${order.orderNo} 吗？`,
      '取消订单',
      {
        type: 'warning'
      }
    )
    ElMessage.success('订单已取消')
  } catch {
    // 用户取消
  }
}

// 分页事件
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadData()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadData()
}

// 监听路由参数变化
watch(
  () => route.params,
  (newParams) => {
    activityId.value = newParams.id as string
    groupId.value = newParams.groupId as string
    loadData()
  }
)

// 初始化
onMounted(() => {
  loadData()
})

// 导出组件
defineOptions({
  name: 'GroupBuyingOrderList'
})
</script>

<style scoped>
.group-buying-order-list {
  padding: 0;
}

.search-card {
  margin-bottom: 20px;
}

.order-info {
  line-height: 1.6;
}

.order-no {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.order-time {
  font-size: 12px;
  color: #909399;
}

.group-info {
  line-height: 1.6;
}

.group-id {
  font-family: monospace;
  color: #606266;
  margin-bottom: 4px;
}

.group-status {
  font-size: 12px;
  color: #909399;
}

.user-info {
  line-height: 1.6;
}

.user-phone {
  font-size: 12px;
  color: #909399;
}

.product-info {
  line-height: 1.6;
}

.product-name {
  color: #303133;
  margin-bottom: 4px;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.original-price {
  color: #909399;
  text-decoration: line-through;
}

.group-price {
  color: #f56c6c;
  font-weight: 600;
}

.quantity {
  color: #606266;
}

.amount-info {
  line-height: 1.6;
}

.total-amount {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.discount {
  font-size: 12px;
  color: #f56c6c;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
}
</style>
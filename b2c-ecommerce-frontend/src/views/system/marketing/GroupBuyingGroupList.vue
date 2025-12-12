<template>
  <div class="group-buying-group-list">
    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="团购ID">
          <el-input
            v-model="searchForm.groupId"
            placeholder="请输入团购ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="开团时间">
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
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="拼团中" value="pending" />
            <el-option label="已成团" value="completed" />
            <el-option label="已失败" value="failed" />
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

    <!-- 团购列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column label="团购信息" width="200">
          <template #default="{ row }">
            <div class="group-info">
              <div class="group-id">T{{ row.id.toString().padStart(6, '0') }}</div>
              <div class="group-time">{{ row.startTime }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成团进度" width="200">
          <template #default="{ row }">
            <div class="progress-info">
              <div class="progress-text">
                <span class="current">{{ row.participants }}</span>
                <span class="separator">/</span>
                <span class="target">{{ row.required }}</span>
              </div>
              <el-progress
                :percentage="getProgress(row)"
                :color="getProgressColor(getProgress(row))"
                :stroke-width="8"
              />
              <div class="progress-status">
                {{ getStatusText(row.status) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成团时间" width="180">
          <template #default="{ row }">
            <span v-if="row.completedTime">{{ row.completedTime }}</span>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column label="订单数量" width="120">
          <template #default="{ row }">
            {{ row.orderCount }}
          </template>
        </el-table-column>
        <el-table-column label="订单总额" width="120">
          <template #default="{ row }">
            ¥{{ row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column label="优惠金额" width="120">
          <template #default="{ row }">
            <span class="discount-amount">-¥{{ row.discountAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewOrders(row)">
              查看订单
            </el-button>
            <el-button v-if="row.status === 'failed'" type="danger" size="small" @click="handleRefund(row)">
              退款
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

// Props
interface Props {
  groupBuyingActivity: any
}
const props = defineProps<Props>()

// Router
const router = useRouter()

// 响应式数据
const loading = ref(false)
const tableData = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  groupId: '',
  dateRange: [],
  status: ''
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 模拟团购数据
const mockGroups = ref<any[]>([
  {
    id: 1,
    startTime: '2024-01-10 10:30:00',
    completedTime: '2024-01-10 14:20:00',
    participants: 20,
    required: 20,
    status: 'completed',
    orderCount: 20,
    totalAmount: 19980,
    discountAmount: 2000
  },
  {
    id: 2,
    startTime: '2024-01-11 09:15:00',
    completedTime: '',
    participants: 15,
    required: 20,
    status: 'pending',
    orderCount: 15,
    totalAmount: 14985,
    discountAmount: 1500
  },
  {
    id: 3,
    startTime: '2024-01-11 14:45:00',
    completedTime: '2024-01-11 18:30:00',
    participants: 20,
    required: 20,
    status: 'completed',
    orderCount: 20,
    totalAmount: 19980,
    discountAmount: 2000
  },
  {
    id: 4,
    startTime: '2024-01-12 11:00:00',
    completedTime: '',
    participants: 8,
    required: 20,
    status: 'pending',
    orderCount: 8,
    totalAmount: 7992,
    discountAmount: 800
  },
  {
    id: 5,
    startTime: '2024-01-12 15:30:00',
    completedTime: '2024-01-13 15:30:00',
    participants: 12,
    required: 20,
    status: 'failed',
    orderCount: 12,
    totalAmount: 11988,
    discountAmount: 1200
  },
  {
    id: 6,
    startTime: '2024-01-13 08:00:00',
    completedTime: '',
    participants: 18,
    required: 20,
    status: 'pending',
    orderCount: 18,
    totalAmount: 17982,
    discountAmount: 1800
  },
  {
    id: 7,
    startTime: '2024-01-13 10:00:00',
    completedTime: '2024-01-13 16:00:00',
    participants: 20,
    required: 20,
    status: 'completed',
    orderCount: 20,
    totalAmount: 19980,
    discountAmount: 2000
  },
  {
    id: 8,
    startTime: '2024-01-14 09:00:00',
    completedTime: '',
    participants: 5,
    required: 20,
    status: 'pending',
    orderCount: 5,
    totalAmount: 4995,
    discountAmount: 500
  }
])

// 获取进度百分比
const getProgress = (group: any) => {
  return Math.round((group.participants / group.required) * 100)
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '拼团中',
    completed: '已成团',
    failed: '已失败'
  }
  return textMap[status] || status
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return '#67c23a'
  if (percentage >= 75) return '#e6a23c'
  if (percentage >= 50) return '#409eff'
  return '#f56c6c'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 筛选数据
    let filteredData = [...mockGroups.value]

    if (searchForm.groupId) {
      const id = parseInt(searchForm.groupId.replace('T', ''))
      filteredData = filteredData.filter(item => item.id === id)
    }

    if (searchForm.status) {
      filteredData = filteredData.filter(item => item.status === searchForm.status)
    }

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      const [startDate, endDate] = searchForm.dateRange
      filteredData = filteredData.filter(item => {
        return item.startTime >= startDate && item.startTime <= endDate
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

// 查看订单
const handleViewOrders = (group: any) => {
  // 假设从父组件props中获取团购活动ID，如果没有，使用默认值1
  const activityId = props.groupBuyingActivity?.id || 1
  router.push(`/system/group-buying/${activityId}/groups/${group.id}/orders`)
}

// 退款
const handleRefund = async (group: any) => {
  try {
    await ElMessageBox.confirm(
      `确认对团购 T${group.id.toString().padStart(6, '0')} 进行退款吗？`,
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

// 分页事件
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadData()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadData()
}

// 初始化
onMounted(() => {
  loadData()
})

// 导出组件
defineOptions({
  name: 'GroupBuyingGroupList'
})
</script>

<style scoped>
.group-buying-group-list {
  padding: 0;
}

.search-card {
  margin-bottom: 20px;
}

.group-info {
  line-height: 1.6;
}

.group-id {
  font-family: monospace;
  font-weight: 600;
  color: #606266;
  margin-bottom: 4px;
}

.group-time {
  font-size: 12px;
  color: #909399;
}

.progress-info {
  text-align: center;
}

.progress-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.progress-text .current {
  color: #409eff;
  font-size: 18px;
}

.progress-text .separator {
  color: #909399;
  margin: 0 5px;
}

.progress-text .target {
  color: #303133;
}

.progress-status {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
}

.discount-amount {
  color: #f56c6c;
  font-weight: 600;
}

.text-gray {
  color: #909399;
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
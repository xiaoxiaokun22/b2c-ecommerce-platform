<template>
  <div class="seckill-list">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2>秒杀活动管理</h2>
      <div class="actions">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建秒杀
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 今日秒杀场次概览 -->
    <el-card class="overview-card">
      <template #header>
        <div class="card-header">
          <span>今日秒杀场次</span>
          <span class="current-date">{{ currentDate }}</span>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col
          v-for="session in todaySessions"
          :key="session.id"
          :span="8"
        >
          <div class="session-card" :class="getSessionStatusClass(session.status)">
            <div class="session-header">
              <h3>{{ session.name }}</h3>
              <el-tag :type="getStatusType(session.status)">
                {{ getStatusText(session.status) }}
              </el-tag>
            </div>
            <div class="session-time">
              {{ session.startTime }} - {{ session.endTime }}
            </div>
            <div class="session-products">
              <div class="product-count">
                {{ session.products.length }}个商品
              </div>
              <div class="product-list">
                <el-tooltip
                  v-for="product in session.products.slice(0, 3)"
                  :key="product.productId"
                  :content="product.productName"
                  placement="top"
                >
                  <el-image
                    :src="product.imageUrl"
                    fit="cover"
                    style="width: 40px; height: 40px; margin-right: 8px;"
                  />
                </el-tooltip>
                <span v-if="session.products.length > 3" class="more-products">
                  +{{ session.products.length - 3 }}
                </span>
              </div>
            </div>
            <div class="session-progress">
              <el-progress
                :percentage="getSessionProgress(session)"
                :color="getProgressColor(getSessionProgress(session))"
                :stroke-width="6"
              />
              <div class="progress-text">
                总计已售 {{ getTotalSold(session) }} / {{ getTotalStock(session) }}
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="活动日期">
          <el-date-picker
            v-model="searchForm.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            clearable
          />
        </el-form-item>
        <el-form-item label="场次状态">
          <el-select
            v-model="searchForm.sessionStatus"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="等待中" value="waiting" />
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入商品名称"
            clearable
            style="width: 200px"
          />
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

    <!-- 秒杀活动列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column prop="date" label="活动日期" width="120" />
        <el-table-column label="场次信息" width="160">
          <template #default="{ row }">
            <div class="session-summary">
              <div>{{ row.sessions.length }}个场次</div>
              <div>{{ getTotalProducts(row) }}个商品</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="活动状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getActivityStatusType(row)">
              {{ getActivityStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="参与情况" width="150">
          <template #default="{ row }">
            <div class="participation-info">
              <div>参与人次: {{ getTotalParticipants(row) }}</div>
              <div>销售额: ¥{{ getTotalSales(row) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="info" size="small" @click="handleView(row)">
              详情
            </el-button>
            </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.current"
          :page-size="pagination.pageSize"
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
      v-model="detailVisible"
      title="秒杀活动详情"
      width="90%"
      :before-close="handleCloseDetail"
      top="5vh"
    >
      <seckill-detail v-if="selectedActivity" :seckill-activity="selectedActivity" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, Search, RefreshLeft
} from '@element-plus/icons-vue'
import { mockSeckillActivities } from '@/mock/marketing'
import SeckillDetail from './SeckillDetail.vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const tableData = ref<any[]>([])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 详情对话框相关
const detailVisible = ref(false)
const selectedActivity = ref<any>(null)

// 搜索表单
const searchForm = reactive({
  date: '',
  sessionStatus: '',
  productName: ''
})

// 当前日期
const currentDate = computed(() => {
  const today = new Date()
  return today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
})

// 今日秒杀场次
const todaySessions = computed(() => {
  const today = mockSeckillActivities.find(
    activity => activity.date === currentDate.value
  )
  return today ? today.sessions : []
})

// 获取场次状态样式类
const getSessionStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    waiting: 'session-waiting',
    active: 'session-active',
    ended: 'session-ended'
  }
  return classMap[status] || ''
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    waiting: 'info',
    active: 'success',
    ended: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    waiting: '等待中',
    active: '进行中',
    ended: '已结束'
  }
  return textMap[status] || '未知'
}

// 获取场次进度
const getSessionProgress = (session: any) => {
  const totalSold = getTotalSold(session)
  const totalStock = getTotalStock(session)
  if (totalStock === 0) return 0
  return Math.round((totalSold / totalStock) * 100)
}

// 获取总销量
const getTotalSold = (session: any) => {
  return session.products.reduce((sum: number, product: any) => sum + product.sold, 0)
}

// 获取总库存
const getTotalStock = (session: any) => {
  return session.products.reduce((sum: number, product: any) => sum + product.stock, 0)
}

// 获取总商品数
const getTotalProducts = (activity: any) => {
  return activity.sessions.reduce(
    (sum: number, session: any) => sum + session.products.length,
    0
  )
}

// 获取总参与人次
const getTotalParticipants = (activity: any) => {
  return activity.sessions.reduce(
    (sum: number, session: any) => sum + getTotalSold(session),
    0
  )
}

// 获取总销售额
const getTotalSales = (activity: any) => {
  let total = 0
  activity.sessions.forEach((session: any) => {
    session.products.forEach((product: any) => {
      total += product.sold * product.seckillPrice
    })
  })
  return total.toFixed(2)
}

// 获取活动状态类型
const getActivityStatusType = (activity: any) => {
  const hasActive = activity.sessions.some((s: any) => s.status === 'active')
  const hasWaiting = activity.sessions.some((s: any) => s.status === 'waiting')
  const allEnded = activity.sessions.every((s: any) => s.status === 'ended')

  if (hasActive) return 'success'
  if (hasWaiting) return 'warning'
  if (allEnded) return 'info'
  return 'info'
}

// 获取活动状态文本
const getActivityStatusText = (activity: any) => {
  const hasActive = activity.sessions.some((s: any) => s.status === 'active')
  const hasWaiting = activity.sessions.some((s: any) => s.status === 'waiting')
  const allEnded = activity.sessions.every((s: any) => s.status === 'ended')

  if (hasActive) return '进行中'
  if (hasWaiting) return '待开始'
  if (allEnded) return '已结束'
  return '未知'
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#409eff'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

// 判断活动是否可编辑
const isActivityEditable = (activity: any) => {
  // 如果所有场次都未开始，则可以编辑
  return activity.sessions.every((s: any) => s.status === 'waiting')
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 筛选数据
    let filteredData = [...mockSeckillActivities]

    if (searchForm.date) {
      filteredData = filteredData.filter(item => item.date === searchForm.date)
    }

    if (searchForm.sessionStatus) {
      filteredData = filteredData.filter(item =>
        item.sessions.some((session: any) => session.status === searchForm.sessionStatus)
      )
    }

    if (searchForm.productName) {
      filteredData = filteredData.filter(item =>
        item.sessions.some((session: any) =>
          session.products.some((product: any) =>
            product.productName.toLowerCase().includes(searchForm.productName.toLowerCase())
          )
        )
      )
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

// 刷新
const handleRefresh = () => {
  loadData()
}

// 创建秒杀活动
const handleCreate = () => {
  router.push('/system/seckill/create')
}

// 编辑秒杀活动
const handleEdit = (row: any) => {
  if (isActivityEditable(row)) {
    router.push(`/system/seckill/create?edit=${row.id}`)
  } else {
    ElMessage.warning('活动已开始或已结束，无法编辑')
  }
}

// 查看详情
const handleView = (row: any) => {
  selectedActivity.value = row
  detailVisible.value = true
}


// 关闭详情对话框
const handleCloseDetail = () => {
  detailVisible.value = false
  selectedActivity.value = null
}


// 删除活动
const handleDeleteActivity = async (row: any) => {
  if (!isActivityEditable(row)) {
    ElMessage.warning('活动已开始或已结束，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认删除${row.date}的秒杀活动吗？删除后不可恢复。`,
      '删除活动',
      {
        type: 'error'
      }
    )

    // 模拟API调用
    const index = mockSeckillActivities.findIndex(item => item.id === row.id)
    if (index > -1) {
      mockSeckillActivities.splice(index, 1)
    }
    ElMessage.success('活动已删除')
    loadData()
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
</script>

<style scoped>
.seckill-list {
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

.overview-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-date {
  font-size: 16px;
  color: #409eff;
  font-weight: 500;
}

.session-card {
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background-color: #fff;
  transition: all 0.3s;
}

.session-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.session-card.session-waiting {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
}

.session-card.session-active {
  border-color: #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #f0f9ff 100%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(103, 194, 58, 0); }
  100% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0); }
}

.session-card.session-ended {
  border-color: #909399;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.session-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.session-time {
  color: #606266;
  margin-bottom: 15px;
}

.session-products {
  margin-bottom: 15px;
}

.product-count {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.product-list {
  display: flex;
  align-items: center;
}

.more-products {
  font-size: 14px;
  color: #909399;
  margin-left: 8px;
}

.session-progress {
  margin-top: 10px;
}

.progress-text {
  font-size: 12px;
  color: #909399;
  text-align: center;
  margin-top: 5px;
}

.search-card {
  margin-bottom: 20px;
}

.expand-content {
  padding: 20px;
}

.expand-content h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.product-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.original-price {
  color: #909399;
  text-decoration: line-through;
  font-size: 14px;
}

.seckill-price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.discount {
  background-color: #f56c6c;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.stock-info {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.session-summary {
  line-height: 1.6;
  color: #606266;
}

.participation-info {
  line-height: 1.6;
  color: #606266;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
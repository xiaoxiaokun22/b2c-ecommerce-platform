<template>
  <div class="group-buying-list">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2>团购活动管理</h2>
      <div class="actions">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建团购
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6f7ff;">
              <el-icon size="24" color="#1890ff"><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总团购数</div>
              <div class="stat-value">{{ stats.total }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f6ffed;">
              <el-icon size="24" color="#52c41a"><Check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">进行中</div>
              <div class="stat-value">{{ stats.active }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fff7e6;">
              <el-icon size="24" color="#fa8c16"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总订单</div>
              <div class="stat-value">{{ stats.orders }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f0f2f5;">
              <el-icon size="24" color="#8c8c8c"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总优惠</div>
              <div class="stat-value">¥{{ stats.savings }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="活动名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入活动名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入商品名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="待开始" value="waiting" />
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
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

    <!-- 团购活动列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="product-info">
              <el-image
                :src="getProductImage(row)"
                fit="cover"
                style="width: 80px; height: 80px; margin-right: 15px;"
              />
              <div class="product-details">
                <div class="product-name">{{ row.name }}</div>
                <div class="group-name">{{ row.productName }}</div>
                <div class="price-info">
                  <span class="group-price">¥{{ row.groupPrice }}</span>
                  <span class="original-price">¥{{ row.originalPrice }}</span>
                  <span class="savings">
                    省¥{{ (row.originalPrice - row.groupPrice).toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="团购规则" width="200">
          <template #default="{ row }">
            <div class="group-rules">
              <div class="rule-item">
                <el-icon size="14"><User /></el-icon>
                {{ row.groupSize }}人成团
              </div>
              <div class="rule-item">
                <el-icon size="14"><Clock /></el-icon>
                {{ row.rules.groupValidHours }}小时内成团
              </div>
              <div class="rule-item">
                <el-icon size="14"><Flag /></el-icon>
                最多{{ row.rules.maxParticipants }}人
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成团进度" width="200">
          <template #default="{ row }">
            <div class="progress-info">
              <div class="progress-text">
                <span class="current">{{ row.currentGroupSize }}</span>
                <span class="separator">/</span>
                <span class="target">{{ row.groupSize }}</span>
              </div>
              <el-progress
                :percentage="getGroupProgress(row)"
                :color="getProgressColor(getGroupProgress(row))"
                :stroke-width="8"
              />
              <div class="progress-status">
                {{ getGroupProgressText(row) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="参与情况" width="180">
          <template #default="{ row }">
            <div class="participation-info">
              <div class="count-item">
                <span class="label">开团数:</span>
                <span class="value">{{ row.currentGroupCount }}</span>
              </div>
              <div class="count-item">
                <span class="label">订单数:</span>
                <span class="value">{{ row.totalOrders }}</span>
              </div>
              <div class="count-item">
                <span class="label">节省金额:</span>
                <span class="value savings">¥{{ row.totalSavings }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="活动时间" width="200">
          <template #default="{ row }">
            <div class="time-info">
              <div>{{ row.startTime }}</div>
              <div>{{ row.endTime }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建信息" width="150">
          <template #default="{ row }">
            <div>
              <div>{{ row.creator }}</div>
              <div>{{ row.createTime }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="info" size="small" @click="handleView(row)">
              详情
            </el-button>
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small" type="warning">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="groups">
                    查看团列表
                  </el-dropdown-item>
                  <el-dropdown-item command="orders">
                    查看订单
                  </el-dropdown-item>
                  <el-dropdown-item command="copy">
                    复制活动
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status === 'waiting'"
                    command="delete"
                    divided
                  >
                    删除活动
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, Search, RefreshLeft, UserFilled, Check,
  ShoppingCart, Money, User, Clock, Flag, ArrowDown
} from '@element-plus/icons-vue'
import { mockGroupBuyingActivities } from '@/mock/marketing'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const tableData = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  name: '',
  productName: '',
  status: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 统计数据
const stats = computed(() => {
  const total = mockGroupBuyingActivities.length
  const active = mockGroupBuyingActivities.filter(item => item.status === 'active').length
  const orders = mockGroupBuyingActivities.reduce(
    (sum, item) => sum + item.totalOrders,
    0
  )
  const savings = mockGroupBuyingActivities.reduce(
    (sum, item) => sum + item.totalSavings,
    0
  )

  return { total, active, orders, savings }
})

// 获取商品图片
const getProductImage = (activity: any) => {
  // 模拟返回图片URL
  return `/images/products/${activity.productId}.jpg`
}

// 获取团购进度
const getGroupProgress = (activity: any) => {
  return Math.round((activity.currentGroupSize / activity.groupSize) * 100)
}

// 获取团购进度文本
const getGroupProgressText = (activity: any) => {
  if (activity.currentGroupSize >= activity.groupSize) {
    return '已成团'
  }
  const remaining = activity.groupSize - activity.currentGroupSize
  return `还差${remaining}人成团`
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    waiting: 'info',
    active: 'success',
    ended: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    waiting: '待开始',
    active: '进行中',
    ended: '已结束'
  }
  return textMap[status] || '未知'
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return '#67c23a'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 筛选数据
    let filteredData = [...mockGroupBuyingActivities]

    if (searchForm.name) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }

    if (searchForm.productName) {
      filteredData = filteredData.filter(item =>
        item.productName.toLowerCase().includes(searchForm.productName.toLowerCase())
      )
    }

    if (searchForm.status) {
      filteredData = filteredData.filter(item => item.status === searchForm.status)
    }

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      const [startDate, endDate] = searchForm.dateRange
      filteredData = filteredData.filter(item => {
        const itemStartDate = item.startTime.split(' ')[0]
        const itemEndDate = item.endTime.split(' ')[0]
        return itemStartDate >= startDate && itemEndDate <= endDate
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

// 刷新
const handleRefresh = () => {
  loadData()
}

// 创建团购活动
const handleCreate = () => {
  router.push('/system/group-buying/create')
}

// 编辑团购活动
const handleEdit = (row: any) => {
  if (row.status === 'waiting') {
    router.push(`/system/group-buying/create?edit=${row.id}`)
  } else {
    ElMessage.warning('活动已开始或已结束，无法编辑')
  }
}

// 查看详情
const handleView = (row: any) => {
  ElMessage.info(`查看团购活动详情: ${row.name}`)
}

// 处理下拉菜单命令
const handleCommand = (command: string, row: any) => {
  switch (command) {
    case 'groups':
      handleViewGroups(row)
      break
    case 'orders':
      handleViewOrders(row)
      break
    case 'copy':
      handleCopyActivity(row)
      break
    case 'delete':
      handleDeleteActivity(row)
      break
  }
}

// 查看团列表
const handleViewGroups = (row: any) => {
  ElMessage.info(`查看团列表: ${row.name}`)
}

// 查看订单
const handleViewOrders = (row: any) => {
  ElMessage.info(`查看团购订单: ${row.name}`)
}

// 复制活动
const handleCopyActivity = (row: any) => {
  ElMessage.success(`复制团购活动: ${row.name}`)
  router.push(`/system/group-buying/create?copy=${row.id}`)
}

// 删除活动
const handleDeleteActivity = async (row: any) => {
  if (row.status !== 'waiting') {
    ElMessage.warning('只能删除待开始的活动')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认删除团购活动"${row.name}"吗？删除后不可恢复。`,
      '删除活动',
      {
        type: 'error'
      }
    )

    // 模拟API调用
    const index = mockGroupBuyingActivities.findIndex(item => item.id === row.id)
    if (index > -1) {
      mockGroupBuyingActivities.splice(index, 1)
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
.group-buying-list {
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

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 100px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.search-card {
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.group-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-price {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.original-price {
  color: #909399;
  text-decoration: line-through;
  font-size: 14px;
}

.savings {
  background-color: #f56c6c;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.group-rules {
  line-height: 1.8;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #606266;
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

.participation-info {
  line-height: 1.8;
}

.count-item {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}

.count-item .label {
  color: #909399;
}

.count-item .value {
  color: #303133;
  font-weight: 500;
}

.count-item .value.savings {
  color: #f56c6c;
}

.time-info {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
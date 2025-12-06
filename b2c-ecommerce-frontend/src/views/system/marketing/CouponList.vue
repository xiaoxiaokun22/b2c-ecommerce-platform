<template>
  <div class="coupon-list">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2>优惠券管理</h2>
      <div class="actions">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建优惠券
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
              <el-icon size="24" color="#1890ff"><Ticket /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">优惠券总数</div>
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
              <div class="stat-title">已领取</div>
              <div class="stat-value">{{ stats.received }}</div>
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
              <div class="stat-title">已使用</div>
              <div class="stat-value">{{ stats.used }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f0f2f5;">
              <el-icon size="24" color="#8c8c8c"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">已过期</div>
              <div class="stat-value">{{ stats.expired }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="优惠券名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入优惠券名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="优惠券类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择类型"
            clearable
            style="width: 150px"
          >
            <el-option label="满减券" value="full_reduction" />
            <el-option label="折扣券" value="discount" />
            <el-option label="现金券" value="cash" />
          </el-select>
        </el-form-item>
        <el-form-item label="领取条件">
          <el-select
            v-model="searchForm.receiveCondition"
            placeholder="请选择条件"
            clearable
            style="width: 150px"
          >
            <el-option label="全部用户" value="all_user" />
            <el-option label="新用户" value="new_user" />
            <el-option label="会员生日" value="member_birthday" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="有效" value="active" />
            <el-option label="无效" value="inactive" />
            <el-option label="已过期" value="expired" />
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

    <!-- 优惠券列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column prop="name" label="优惠券名称" min-width="200" />
        <el-table-column label="优惠券信息" width="200">
          <template #default="{ row }">
            <div class="coupon-info">
              <div class="denomination">
                {{ formatCouponValue(row) }}
              </div>
              <div class="condition">
                {{ formatCondition(row) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="180">
          <template #default="{ row }">
            <div class="valid-period">
              <div>{{ row.validDays }}天有效期</div>
              <div>{{ row.receiveStartTime }} ~ {{ row.receiveEndTime }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="领取情况" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="getReceivePercentage(row)"
              :color="getProgressColor(getReceivePercentage(row))"
              :stroke-width="8"
            />
            <div class="progress-text">
              {{ row.receivedQuantity }} / {{ row.totalQuantity }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="使用情况" width="150">
          <template #default="{ row }">
            <div class="usage-info">
              <div>已使用: {{ row.usedQuantity }}</div>
              <div>使用率: {{ getUsageRate(row) }}%</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="领取条件" width="120">
          <template #default="{ row }">
            <el-tag size="small">
              {{ getReceiveConditionText(row.receiveCondition) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
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
                  <el-dropdown-item command="statistics">
                    数据统计
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status === 'active'"
                    command="deactivate"
                  >
                    停用
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status === 'inactive'"
                    command="activate"
                  >
                    启用
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    删除
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
  Plus, Refresh, Search, RefreshLeft, Ticket, Check,
  ShoppingCart, Clock, ArrowDown
} from '@element-plus/icons-vue'
import { mockCoupons } from '@/mock/marketing'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const tableData = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  receiveCondition: '',
  status: ''
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 统计数据
const stats = computed(() => {
  const total = mockCoupons.length
  const received = mockCoupons.reduce((sum, item) => sum + item.receivedQuantity, 0)
  const used = mockCoupons.reduce((sum, item) => sum + item.usedQuantity, 0)
  const expired = mockCoupons.filter(item => item.status === 'expired').length

  return { total, received, used, expired }
})

// 格式化优惠券面值
const formatCouponValue = (coupon: any) => {
  if (coupon.type === 'full_reduction' || coupon.type === 'cash') {
    return `¥${coupon.denomination}`
  } else if (coupon.type === 'discount') {
    return `${coupon.denomination * 10}折`
  }
  return '-'
}

// 格式化使用条件
const formatCondition = (coupon: any) => {
  if (!coupon.condition?.minAmount) return '无门槛'
  return `满${coupon.condition.minAmount}元可用`
}

// 获取领取进度百分比
const getReceivePercentage = (coupon: any) => {
  if (coupon.totalQuantity === 0) return 0
  return Math.round((coupon.receivedQuantity / coupon.totalQuantity) * 100)
}

// 获取使用率
const getUsageRate = (coupon: any) => {
  if (coupon.receivedQuantity === 0) return 0
  return Math.round((coupon.usedQuantity / coupon.receivedQuantity) * 100)
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#409eff'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

// 获取领取条件文本
const getReceiveConditionText = (condition: string) => {
  const textMap: Record<string, string> = {
    all_user: '全部用户',
    new_user: '新用户',
    member_birthday: '会员生日'
  }
  return textMap[condition] || condition
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'success',
    inactive: 'warning',
    expired: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '有效',
    inactive: '无效',
    expired: '已过期'
  }
  return textMap[status] || '未知'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 筛选数据
    let filteredData = [...mockCoupons]

    if (searchForm.name) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }

    if (searchForm.type) {
      filteredData = filteredData.filter(item => item.type === searchForm.type)
    }

    if (searchForm.receiveCondition) {
      filteredData = filteredData.filter(
        item => item.receiveCondition === searchForm.receiveCondition
      )
    }

    if (searchForm.status) {
      filteredData = filteredData.filter(item => item.status === searchForm.status)
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

// 创建优惠券
const handleCreate = () => {
  router.push('/system/coupons/create')
}

// 编辑优惠券
const handleEdit = (row: any) => {
  router.push(`/system/coupons/create?edit=${row.id}`)
}

// 查看详情
const handleView = (row: any) => {
  ElMessage.info(`查看优惠券详情: ${row.name}`)
}

// 处理下拉菜单命令
const handleCommand = async (command: string, row: any) => {
  switch (command) {
    case 'statistics':
      handleViewStatistics(row)
      break
    case 'activate':
      await handleActivateCoupon(row)
      break
    case 'deactivate':
      await handleDeactivateCoupon(row)
      break
    case 'delete':
      await handleDeleteCoupon(row)
      break
  }
}

// 查看统计
const handleViewStatistics = (row: any) => {
  ElMessage.info(`查看优惠券统计: ${row.name}`)
}

// 启用优惠券
const handleActivateCoupon = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确认启用优惠券"${row.name}"吗？`,
      '启用优惠券',
      {
        type: 'warning'
      }
    )

    // 模拟API调用
    row.status = 'active'
    ElMessage.success('优惠券已启用')
    loadData()
  } catch {
    // 用户取消
  }
}

// 停用优惠券
const handleDeactivateCoupon = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确认停用优惠券"${row.name}"吗？停用后用户将无法领取。`,
      '停用优惠券',
      {
        type: 'warning'
      }
    )

    // 模拟API调用
    row.status = 'inactive'
    ElMessage.success('优惠券已停用')
    loadData()
  } catch {
    // 用户取消
  }
}

// 删除优惠券
const handleDeleteCoupon = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确认删除优惠券"${row.name}"吗？删除后不可恢复。`,
      '删除优惠券',
      {
        type: 'error'
      }
    )

    // 模拟API调用
    const index = mockCoupons.findIndex(item => item.id === row.id)
    if (index > -1) {
      mockCoupons.splice(index, 1)
    }
    ElMessage.success('优惠券已删除')
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
.coupon-list {
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

.coupon-info {
  line-height: 1.4;
}

.denomination {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
}

.condition {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.valid-period {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.progress-text {
  font-size: 12px;
  color: #909399;
  text-align: center;
  margin-top: 4px;
}

.usage-info {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
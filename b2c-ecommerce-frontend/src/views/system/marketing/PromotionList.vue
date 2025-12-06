<template>
  <div class="promotion-list">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2>促销活动管理</h2>
      <div class="actions">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建活动
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
              <el-icon size="24" color="#1890ff"><Promotion /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总活动数</div>
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
              <el-icon size="24" color="#fa8c16"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">待开始</div>
              <div class="stat-value">{{ stats.pending }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f0f2f5;">
              <el-icon size="24" color="#8c8c8c"><Flag /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">已结束</div>
              <div class="stat-value">{{ stats.ended }}</div>
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
        <el-form-item label="活动类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择类型"
            clearable
            style="width: 150px"
          >
            <el-option label="满减优惠" value="full_reduction" />
            <el-option label="折扣优惠" value="discount" />
            <el-option label="限时特价" value="limited_offer" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="待开始" value="pending" />
            <el-option label="进行中" value="active" />
            <el-option label="已暂停" value="paused" />
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

    <!-- 活动列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column prop="name" label="活动名称" min-width="200" />
        <el-table-column label="活动类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="活动时间" width="300">
          <template #default="{ row }">
            <div>
              <div>{{ row.startTime }}</div>
              <div>{{ row.endTime }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="活动状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="使用情况" width="150">
          <template #default="{ row }">
            <div class="usage-info">
              <div>使用: {{ row.totalUsage }}次</div>
              <div>优惠: ¥{{ row.totalDiscount }}</div>
            </div>
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
                  <el-dropdown-item
                    v-if="row.status === 'active'"
                    command="pause"
                  >
                    暂停活动
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status === 'paused'"
                    command="resume"
                  >
                    恢复活动
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status === 'pending' || row.status === 'paused'"
                    command="delete"
                    divided
                  >
                    删除活动
                  </el-dropdown-item>
                  <el-dropdown-item command="copy">
                    复制活动
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
  Plus, Refresh, Search, RefreshLeft, Promotion, Check,
  Clock, Flag, ArrowDown
} from '@element-plus/icons-vue'
import { mockPromotions } from '@/mock/marketing'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const tableData = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
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
  const total = mockPromotions.length
  const active = mockPromotions.filter(item => item.status === 'active').length
  const pending = mockPromotions.filter(item => item.status === 'pending').length
  const ended = mockPromotions.filter(item => item.status === 'ended').length

  return { total, active, pending, ended }
})

// 获取类型标签类型
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    full_reduction: 'primary',
    discount: 'success',
    limited_offer: 'warning'
  }
  return typeMap[type] || 'info'
}

// 获取类型文本
const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    full_reduction: '满减优惠',
    discount: '折扣优惠',
    limited_offer: '限时特价'
  }
  return textMap[type] || '未知'
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'info',
    active: 'success',
    paused: 'warning',
    ended: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待开始',
    active: '进行中',
    paused: '已暂停',
    ended: '已结束'
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
    let filteredData = [...mockPromotions]

    if (searchForm.name) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }

    if (searchForm.type) {
      filteredData = filteredData.filter(item => item.type === searchForm.type)
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

// 创建活动
const handleCreate = () => {
  router.push('/system/promotions/create')
}

// 编辑活动
const handleEdit = (row: any) => {
  router.push(`/system/promotions/edit/${row.id}`)
}

// 查看详情
const handleView = (row: any) => {
  ElMessage.info(`查看活动详情: ${row.name}`)
}

// 处理下拉菜单命令
const handleCommand = async (command: string, row: any) => {
  switch (command) {
    case 'pause':
      await handlePauseActivity(row)
      break
    case 'resume':
      await handleResumeActivity(row)
      break
    case 'delete':
      await handleDeleteActivity(row)
      break
    case 'copy':
      handleCopyActivity(row)
      break
  }
}

// 暂停活动
const handlePauseActivity = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确认暂停活动"${row.name}"吗？暂停后用户将无法参与此活动。`,
      '暂停活动',
      {
        type: 'warning'
      }
    )

    // 模拟API调用
    row.status = 'paused'
    ElMessage.success('活动已暂停')
    loadData()
  } catch {
    // 用户取消
  }
}

// 恢复活动
const handleResumeActivity = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确认恢复活动"${row.name}"吗？`,
      '恢复活动',
      {
        type: 'warning'
      }
    )

    // 模拟API调用
    row.status = 'active'
    ElMessage.success('活动已恢复')
    loadData()
  } catch {
    // 用户取消
  }
}

// 删除活动
const handleDeleteActivity = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确认删除活动"${row.name}"吗？删除后不可恢复。`,
      '删除活动',
      {
        type: 'error'
      }
    )

    // 模拟API调用
    const index = mockPromotions.findIndex(item => item.id === row.id)
    if (index > -1) {
      mockPromotions.splice(index, 1)
    }
    ElMessage.success('活动已删除')
    loadData()
  } catch {
    // 用户取消
  }
}

// 复制活动
const handleCopyActivity = (row: any) => {
  ElMessage.success(`复制活动: ${row.name}`)
  router.push(`/system/promotions/create?copy=${row.id}`)
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
.promotion-list {
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
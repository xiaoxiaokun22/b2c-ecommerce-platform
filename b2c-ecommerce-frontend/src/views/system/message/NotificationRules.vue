<template>
  <div class="notification-rules">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2>通知规则配置</h2>
      <div class="actions">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建规则
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 规则统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6f7ff;">
              <el-icon size="24" color="#1890ff"><Setting /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">规则总数</div>
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
              <div class="stat-title">启用中</div>
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
              <div class="stat-title">今日触发</div>
              <div class="stat-value">{{ stats.todayTriggered }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f0f2f5;">
              <el-icon size="24" color="#8c8c8c"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">待优化</div>
              <div class="stat-value">{{ stats.pending }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="规则名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入规则名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="业务事件">
          <el-select
            v-model="searchForm.businessEvent"
            placeholder="请选择业务事件"
            clearable
            style="width: 180px"
          >
            <el-option label="订单创建" value="order.created" />
            <el-option label="支付成功" value="payment.success" />
            <el-option label="订单发货" value="order.shipped" />
            <el-option label="密码重置" value="user.password_reset" />
            <el-option label="会员生日" value="member.birthday" />
            <el-option label="用户注册" value="user.register" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select
            v-model="searchForm.priority"
            placeholder="请选择优先级"
            clearable
            style="width: 120px"
          >
            <el-option label="高" value="1" />
            <el-option label="中" value="2" />
            <el-option label="低" value="3" />
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

    <!-- 规则列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column prop="name" label="规则名称" min-width="200" />
        <el-table-column prop="businessEvent" label="业务事件" width="150">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ getBusinessEventText(row.businessEvent) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="触发方式" width="120">
          <template #default="{ row }">
            <el-tag :type="getTriggerTypeTag(row.condition.triggerMode)" size="small">
              {{ getTriggerTypeText(row.condition.triggerMode) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="触发条件" width="200">
          <template #default="{ row }">
            <div class="trigger-conditions">
              <div
                v-for="(filter, index) in row.condition.filters"
                :key="index"
                class="filter-item"
              >
                <span>{{ filter.field }}</span>
                <span>{{ getOperatorText(filter.operator) }}</span>
                <span>{{ filter.value }}</span>
              </div>
              <span v-if="row.condition.filters.length === 0" class="no-filter">无条件</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="执行动作" width="200">
          <template #default="{ row }">
            <div class="action-list">
              <div
                v-for="(action, index) in row.actions"
                :key="index"
                class="action-item"
              >
                <el-tag :type="getActionTypeTag(action.type)" size="small">
                  {{ getActionTypeText(action.type) }}
                </el-tag>
                <span class="action-detail">
                  {{ getActionDetail(action) }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="active"
              inactive-value="inactive"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getPriorityTypeTag(row.priority)" size="small">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后触发时间" width="160" />
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="info" size="small" @click="handleTest(row)">
              测试
            </el-button>
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small" type="warning">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="copy">
                    复制规则
                  </el-dropdown-item>
                  <el-dropdown-item command="export">
                    导出配置
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    删除规则
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
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import {
  Plus, Refresh, Search, RefreshLeft, Setting, Check,
  Clock, Warning, ArrowDown
} from '@element-plus/icons-vue'
import { mockNotificationRules, mockMessageTemplates } from '@/mock/message'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const tableData = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  name: '',
  businessEvent: '',
  status: '',
  priority: ''
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 统计数据
const stats = computed(() => {
  const total = mockNotificationRules.length
  const active = mockNotificationRules.filter(rule => rule.status === 'active').length
  const todayTriggered = mockNotificationRules.filter(rule => {
      const lastTrigger = rule.lastTriggerTime
      return lastTrigger && lastTrigger.startsWith(new Date().toISOString().split('T')[0])
    }).length
  const pending = mockNotificationRules.filter(rule => rule.status === 'inactive').length

  return { total, active, todayTriggered, pending }
})

// 获取业务事件文本
const getBusinessEventText = (event: string) => {
  const textMap: Record<string, string> = {
    'order.created': '订单创建',
    'payment.success': '支付成功',
    'order.shipped': '订单发货',
    'user.password_reset': '密码重置',
    'member.birthday': '会员生日',
    'user.register': '用户注册'
  }
  return textMap[event] || event
}

// 获取触发方式标签类型
const getTriggerTypeTag = (mode: string) => {
  const typeMap: Record<string, string> = {
    immediate: 'primary',
    delay: 'warning',
    schedule: 'success'
  }
  return typeMap[mode] || 'info'
}

// 获取触发方式文本
const getTriggerTypeText = (mode: string) => {
  const textMap: Record<string, string> = {
    immediate: '立即触发',
    delay: '延迟触发',
    schedule: '定时触发'
  }
  return textMap[mode] || '未知'
}

// 获取操作符文本
const getOperatorText = (operator: string) => {
  const textMap: Record<string, string> = {
    '>': '大于',
    '<': '小于',
    '>=': '大于等于',
    '<=': '小于等于',
    '==': '等于',
    '!=': '不等于',
    'contains': '包含'
  }
  return textMap[operator] || operator
}

// 获取动作类型标签
const getActionTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    send_message: 'primary'
  }
  return typeMap[type] || 'info'
}

// 获取动作类型文本
const getActionTypeText = (action: any) => {
  const textMap: Record<string, string> = {
    send_message: '发送消息'
  }
  return textMap[action.type] || action.type
}

// 获取动作详情
const getActionDetail = (action: any) => {
  const template = mockMessageTemplates.find(t => t.id === action.templateId)
  if (template) {
    return `发送"${template.name}"消息`
  }
  return '发送消息'
}

// 获取优先级类型标签
const getPriorityTypeTag = (priority: number) => {
  const typeMap: Record<number, string> = {
    1: 'danger',
    2: 'warning',
    3: 'info'
  }
  return typeMap[priority] || 'info'
}

// 获取优先级文本
const getPriorityText = (priority: number) => {
  const textMap: Record<number, string> = {
    1: '高',
    2: '中',
    3: '低'
  }
  return textMap[priority] || '未知'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 筛选数据
    let filteredData = [...mockNotificationRules]

    if (searchForm.name) {
      filteredData = filteredData.filter(rule =>
        rule.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }

    if (searchForm.businessEvent) {
      filteredData = filteredData.filter(rule => rule.businessEvent === searchForm.businessEvent)
    }

    if (searchForm.status) {
      filteredData = filteredData.filter(rule => rule.status === searchForm.status)
    }

    if (searchForm.priority) {
      filteredData = filteredData.filter(rule => rule.priority === parseInt(searchForm.priority))
    }

    // 排序（按优先级和创建时间）
    filteredData.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    })

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

// 创建规则
const handleCreate = () => {
  router.push('/system/notification-rules/create')
}

// 编辑规则
const handleEdit = (row: any) => {
  router.push(`/system/notification-rules/edit/${row.id}`)
}

// 测试规则
const handleTest = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确认测试规则"${row.name}"吗？`,
      '测试确认',
      {
        type: 'info'
      }
    )

    // 模拟测试
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在测试规则...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    loadingInstance.close()
    ElMessage.success('规则测试成功')
  } catch {
    // 用户取消
  }
}

// 状态切换
const handleStatusChange = async (row: any) => {
  const action = row.status === 'active' ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(
      `确认${action}规则"${row.name}"吗？`,
      `${action}确认`,
      {
        type: row.status === 'active' ? 'warning' : 'info'
      }
    )
    ElMessage.success(`规则已${action}`)
  } catch {
    // 用户取消，恢复原状态
    row.status = row.status === 'active' ? 'inactive' : 'active'
  }
}

// 处理下拉菜单命令
const handleCommand = (command: string, row: any) => {
  switch (command) {
    case 'copy':
      handleCopyRule(row)
      break
    case 'export':
      handleExportRule(row)
      break
    case 'delete':
      handleDeleteRule(row)
      break
  }
}

// 复制规则
const handleCopyRule = (row: any) => {
  ElMessage.success(`复制规则: ${row.name}`)
  router.push(`/system/notification-rules/create?copy=${row.id}`)
}

// 导出规则
const handleExportRule = (row: any) => {
  ElMessage.success(`导出规则: ${row.name}`)
}

// 删除规则
const handleDeleteRule = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确认删除规则"${row.name}"吗？删除后不可恢复。`,
      '删除确认',
      {
        type: 'error'
      }
    )

    // 模拟API调用
    const index = mockNotificationRules.findIndex(rule => rule.id === row.id)
    if (index > -1) {
      mockNotificationRules.splice(index, 1)
    }

    ElMessage.success('规则已删除')
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
.notification-rules {
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

.trigger-conditions {
  line-height: 1.6;
}

.filter-item {
  display: inline-flex;
  align-items: center;
  margin-right: 15px;
  margin-bottom: 5px;
}

.filter-item span {
  font-size: 14px;
  color: #606266;
}

.no-filter {
  color: #c0c4cc;
  font-size: 14px;
}

.action-list {
  line-height: 1.6;
}

.action-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.action-detail {
  margin-left: 10px;
  font-size: 12px;
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
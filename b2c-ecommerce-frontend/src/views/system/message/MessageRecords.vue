<template>
  <div class="message-records">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>发送记录</h2>
      <div class="actions">
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出记录
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
              <el-icon size="24" color="#1890ff"><Message /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总发送量</div>
              <div class="stat-value">{{ stats.totalMessages }}</div>
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
              <div class="stat-title">发送成功</div>
              <div class="stat-value">{{ stats.successMessages }}</div>
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
              <div class="stat-title">平均耗时</div>
              <div class="stat-value">{{ stats.avgTime }}秒</div>
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
              <div class="stat-title">总费用</div>
              <div class="stat-value">¥{{ stats.totalCost }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="消息ID">
          <el-input
            v-model="searchForm.messageId"
            placeholder="请输入消息ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="模板名称">
          <el-select
            v-model="searchForm.templateId"
            placeholder="请选择模板"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="template in templateOptions"
              :key="template.id"
              :label="template.name"
              :value="template.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="消息类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择类型"
            clearable
            style="width: 120px"
          >
            <el-option label="短信" value="sms" />
            <el-option label="邮件" value="email" />
            <el-option label="站内信" value="in_app" />
          </el-select>
        </el-form-item>
        <el-form-item label="发送类型">
          <el-select
            v-model="searchForm.sendType"
            placeholder="请选择类型"
            clearable
            style="width: 120px"
          >
            <el-option label="单发" value="single" />
            <el-option label="群发" value="batch" />
            <el-option label="触发" value="trigger" />
          </el-select>
        </el-form-item>
        <el-form-item label="发送状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
            <el-option label="发送中" value="sending" />
            <el-option label="待发送" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="发送时间">
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

    <!-- 记录列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="消息ID" width="150" />
        <el-table-column prop="templateName" label="模板名称" width="150" />
        <el-table-column label="消息类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发送类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getSendTypeTagType(row.sendType)">
              {{ getSendTypeText(row.sendType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="接收人" min-width="200">
          <template #default="{ row }">
            <div class="recipient-info">
              <div v-if="row.sendType === 'single'">
                {{ row.recipient }}
              </div>
              <div v-else>
                {{ row.recipientCount }}个接收人
                <el-button
                  type="text"
                  size="small"
                  @click="handleViewRecipients(row)"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="主题" min-width="200" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发送时间" width="160" />
        <el-table-column label="完成时间" width="160">
          <template #default="{ row }">
            <span v-if="row.completeTime">{{ row.completeTime }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="耗时" width="80" align="right">
          <template #default="{ row }">
            <span v-if="row.completeTime">
              {{ calculateDuration(row.sendTime, row.completeTime) }}s
            </span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="费用" width="100" align="right">
          <template #default="{ row }">
            <span v-if="row.cost > 0">¥{{ row.cost.toFixed(2) }}</span>
            <span v-else class="text-muted">0.00</span>
          </template>
        </el-table-column>
        <el-table-column label="操作员" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 'failed'"
              type="warning"
              size="small"
              @click="handleRetry(row)"
            >
              重试
            </el-button>
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small" type="info">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="viewContent">
                    查看内容
                  </el-dropdown-item>
                  <el-dropdown-item command="export">
                    导出记录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div class="batch-actions">
        <span v-if="selectedRows.length > 0">
          已选择 {{ selectedRows.length }} 条记录
          <el-button type="danger" size="small" @click="handleBatchRetry">
            批量重试
          </el-button>
        </span>
      </div>

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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="发送详情"
      width="800px"
    >
      <div class="detail-content" v-if="selectedRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="消息ID">
            {{ selectedRecord.id }}
          </el-descriptions-item>
          <el-descriptions-item label="模板名称">
            {{ selectedRecord.templateName }}
          </el-descriptions-item>
          <el-descriptions-item label="消息类型">
            <el-tag :type="getTypeTagType(selectedRecord.type)">
              {{ getTypeText(selectedRecord.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发送类型">
            <el-tag :type="getSendTypeTagType(selectedRecord.sendType)">
              {{ getSendTypeText(selectedRecord.sendType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="接收人数">
            {{ selectedRecord.recipientCount }}
          </el-descriptions-item>
          <el-descriptions-item label="发送状态">
            <el-tag :type="getStatusTagType(selectedRecord.status)">
              {{ getStatusText(selectedRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发送时间">
            {{ selectedRecord.sendTime }}
          </el-descriptions-item>
          <el-descriptions-item label="完成时间">
            {{ selectedRecord.completeTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="费用">
            ¥{{ selectedRecord.cost ? selectedRecord.cost.toFixed(2) : '0.00' }}
          </el-descriptions-item>
          <el-descriptions-item label="操作员">
            {{ selectedRecord.operator }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider>消息内容</el-divider>
        <div class="message-content">
          <div class="message-subject">
            <strong>主题：</strong>{{ selectedRecord.subject }}
          </div>
          <div class="message-body">
            <pre>{{ selectedRecord.content }}</pre>
          </div>
        </div>

        <el-divider v-if="selectedRecord.errorCode">错误信息</el-divider>
        <div v-if="selectedRecord.errorCode" class="error-info">
          <el-alert
            :title="selectedRecord.errorCode"
            :description="selectedRecord.errorMessage"
            type="error"
            show-icon
          />
        </div>
      </div>
    </el-dialog>

    <!-- 内容预览对话框 -->
    <el-dialog
      v-model="contentVisible"
      title="消息内容"
      width="600px"
    >
      <div class="content-preview">
        <div class="content-subject">
          <strong>主题：</strong>{{ selectedRecord?.subject }}
        </div>
        <div class="content-body">
          <pre>{{ selectedRecord?.content }}</pre>
        </div>
      </div>
    </el-dialog>

    <!-- 接收人列表对话框 -->
    <el-dialog
      v-model="recipientsVisible"
      title="接收人列表"
      width="600px"
    >
      <el-table :data="currentRecipients" border>
        <el-table-column prop="identifier" label="标识" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="contact" label="联系方式" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download, Refresh, Search, RefreshLeft, Message, Check,
  Clock, Money, ArrowDown
} from '@element-plus/icons-vue'
import { mockMessageRecords, mockMessageTemplates } from '@/mock/message'

// 响应式数据
const loading = ref(false)
const tableData = ref<any[]>([])
const selectedRows = ref<any[]>([])
const detailVisible = ref(false)
const contentVisible = ref(false)
const recipientsVisible = ref(false)
const selectedRecord = ref<any>(null)
const currentRecipients = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  messageId: '',
  templateId: '',
  type: '',
  sendType: '',
  status: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 模板选项
const templateOptions = computed(() => {
  const usedIds = [...new Set(mockMessageRecords.map(r => r.templateId))]
  return mockMessageTemplates.filter(t => usedIds.includes(t.id))
})

// 统计数据
const stats = computed(() => {
  const totalMessages = mockMessageRecords.length
  const successMessages = mockMessageRecords.filter(r => r.status === 'success').length
  const failedMessages = mockMessageRecords.filter(r => r.status === 'failed').length
  const totalCost = mockMessageRecords.reduce((sum, r) => sum + (r.cost || 0), 0)

  // 计算平均耗时（成功的记录）
  const successRecordsWithTime = mockMessageRecords.filter(
    r => r.status === 'success' && r.sendTime && r.completeTime
  )
  const avgTime = successRecordsWithTime.length > 0
    ? (successRecordsWithTime.reduce((sum, r) => {
        const duration = calculateDuration(r.sendTime, r.completeTime)
        return sum + duration
      }, 0) / successRecordsWithTime.length).toFixed(1)
    : '0'

  return {
    totalMessages,
    successMessages,
    avgTime,
    totalCost: totalCost.toFixed(2)
  }
})

// 获取类型标签类型
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    sms: 'primary',
    email: 'success',
    in_app: 'warning'
  }
  return typeMap[type] || 'info'
}

// 获取类型文本
const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    sms: '短信',
    email: '邮件',
    in_app: '站内信'
  }
  return textMap[type] || '未知'
}

// 获取发送类型标签类型
const getSendTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    single: '',
    batch: 'success',
    trigger: 'warning'
  }
  return typeMap[type] || 'info'
}

// 获取发送类型文本
const getSendTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    single: '单发',
    batch: '群发',
    trigger: '触发'
  }
  return textMap[type] || '未知'
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    success: 'success',
    failed: 'danger',
    sending: 'warning',
    pending: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    success: '成功',
    failed: '失败',
    sending: '发送中',
    pending: '待发送'
  }
  return textMap[status] || '未知'
}

// 计算耗时（秒）
const calculateDuration = (startTime: string, endTime: string) => {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  return Math.round((end - start) / 1000)
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 筛选数据
    let filteredData = [...mockMessageRecords]

    if (searchForm.messageId) {
      filteredData = filteredData.filter(item =>
        item.id.toLowerCase().includes(searchForm.messageId.toLowerCase())
      )
    }

    if (searchForm.templateId) {
      filteredData = filteredData.filter(item => item.templateId === searchForm.templateId)
    }

    if (searchForm.type) {
      filteredData = filteredData.filter(item => item.type === searchForm.type)
    }

    if (searchForm.sendType) {
      filteredData = filteredData.filter(item => item.sendType === searchForm.sendType)
    }

    if (searchForm.status) {
      filteredData = filteredData.filter(item => item.status === searchForm.status)
    }

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      const [startDate, endDate] = searchForm.dateRange
      filteredData = filteredData.filter(item => {
        const itemDate = item.sendTime.split(' ')[0]
        return itemDate >= startDate && itemDate <= endDate
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

// 导出记录
const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

// 多选
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 查看详情
const handleViewDetail = (row: any) => {
  selectedRecord.value = row
  detailVisible.value = true
}

// 查看接收人
const handleViewRecipients = (row: any) => {
  // 模拟接收人数据
  if (row.sendType === 'batch') {
    currentRecipients.value = [
      { identifier: '13800138001', name: '张三', contact: '13800138001', status: 'success' },
      { identifier: '13800138002', name: '李四', contact: '13800138002', status: 'success' },
      { identifier: '13800138003', name: '王五', contact: '13800138003', status: 'failed' }
    ]
  } else {
    currentRecipients.value = [
      { identifier: row.recipient, name: '用户', contact: row.recipient, status: row.status }
    ]
  }
  recipientsVisible.value = true
}

// 查看内容
const handleViewContent = (row: any) => {
  selectedRecord.value = row
  contentVisible.value = true
}

// 重试发送
const handleRetry = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认重试发送该消息吗？', '重试确认', {
      type: 'warning'
    })

    // 模拟API调用
    row.status = 'sending'
    row.sendTime = new Date().toISOString()

    setTimeout(() => {
      row.status = Math.random() > 0.2 ? 'success' : 'failed'
      row.completeTime = new Date().toISOString()
      if (row.status === 'success') {
        row.errorCode = null
        row.errorMessage = null
      } else {
        row.errorCode = 'RETRY_FAILED'
        row.errorMessage = '重试发送失败'
      }
    }, 2000)

    ElMessage.success('正在重试发送...')
  } catch {
    // 用户取消
  }
}

// 批量重试
const handleBatchRetry = async () => {
  const failedRecords = selectedRows.value.filter(r => r.status === 'failed')
  if (failedRecords.length === 0) {
    ElMessage.warning('请选择失败的记录')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认重试选中的 ${failedRecords.length} 条失败记录吗？`,
      '批量重试确认',
      {
        type: 'warning'
      }
    )

    // 模拟API调用
    failedRecords.forEach(record => {
      record.status = 'sending'
      record.sendTime = new Date().toISOString()

      setTimeout(() => {
        record.status = Math.random() > 0.2 ? 'success' : 'failed'
        record.completeTime = new Date().toISOString()
      }, 2000)
    })

    ElMessage.success(`正在重试 ${failedRecords.length} 条记录...`)
    selectedRows.value = []
  } catch {
    // 用户取消
  }
}

// 处理下拉菜单命令
const handleCommand = (command: string, row: any) => {
  switch (command) {
    case 'viewContent':
      handleViewContent(row)
      break
    case 'export':
      ElMessage.success('导出单条记录')
      break
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
.message-records {
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

.recipient-info {
  line-height: 1.4;
}

.text-muted {
  color: #c0c4cc;
}

.batch-actions {
  margin-bottom: 10px;
  padding: 10px 0;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.message-content {
  margin-top: 20px;
}

.message-subject {
  margin-bottom: 10px;
  font-size: 14px;
}

.message-body {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.message-body pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 14px;
  color: #606266;
}

.error-info {
  margin-top: 10px;
}

.content-preview {
  max-height: 400px;
  overflow-y: auto;
}

.content-subject {
  margin-bottom: 10px;
  font-size: 14px;
}

.content-body {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.content-body pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 14px;
  color: #606266;
}
</style>
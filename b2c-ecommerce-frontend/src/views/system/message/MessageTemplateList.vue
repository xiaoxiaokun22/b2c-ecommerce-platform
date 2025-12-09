<template>
  <div class="message-template-list">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2>消息模板管理</h2>
      <div class="actions">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建模板
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
              <el-icon size="24" color="#1890ff"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">模板总数</div>
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
              <el-icon size="24" color="#fa8c16"><Message /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总使用量</div>
              <div class="stat-value">{{ stats.usage }}</div>
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
              <div class="stat-title">待审核</div>
              <div class="stat-value">{{ stats.pending }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="模板名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入模板名称"
            clearable
            style="width: 200px"
          />
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
        <el-form-item label="业务类型">
          <el-select
            v-model="searchForm.businessType"
            placeholder="请选择业务类型"
            clearable
            style="width: 150px"
          >
            <el-option label="订单通知" value="order_created" />
            <el-option label="支付通知" value="payment_success" />
            <el-option label="发货通知" value="order_shipped" />
            <el-option label="密码重置" value="password_reset" />
            <el-option label="促销活动" value="promotion" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 100px"
          >
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
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

    <!-- 模板列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column prop="name" label="模板名称" min-width="200" />
        <el-table-column label="消息类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="businessType" label="业务类型" width="120">
          <template #default="{ row }">
            <span>{{ getBusinessTypeText(row.businessType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column label="内容预览" min-width="300">
          <template #default="{ row }">
            <div class="content-preview">
              {{ truncateContent(row.content, 100) }}
              <el-button
                v-if="row.content.length > 100"
                type="text"
                size="small"
                @click="handlePreview(row)"
              >
                查看更多
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="变量" width="150">
          <template #default="{ row }">
            <div v-if="row.variables.length > 0" class="variables">
              <el-tag
                v-for="variable in row.variables.slice(0, 2)"
                :key="variable.name"
                size="small"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ '{' + variable.name + '}' }}
              </el-tag>
              <span v-if="row.variables.length > 2" class="more-variables">
                +{{ row.variables.length - 2 }}
              </span>
            </div>
            <span v-else class="no-variables">无变量</span>
          </template>
        </el-table-column>
        <el-table-column label="使用次数" width="100" align="right">
          <template #default="{ row }">
            {{ row.usageCount.toLocaleString() }}
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
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="info" size="small" @click="handlePreview(row)">
              预览
            </el-button>
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small" type="warning">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="copy">
                    复制模板
                  </el-dropdown-item>
                  <el-dropdown-item command="export">
                    导出模板
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    删除模板
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

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="模板预览"
      width="800px"
    >
      <div class="preview-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="模板名称">
            {{ previewTemplate.name }}
          </el-descriptions-item>
          <el-descriptions-item label="消息类型">
            <el-tag :type="getTypeTagType(previewTemplate.type)">
              {{ getTypeText(previewTemplate.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="业务类型">
            {{ getBusinessTypeText(previewTemplate.businessType) }}
          </el-descriptions-item>
          <el-descriptions-item label="标题">
            {{ previewTemplate.title }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider>模板内容</el-divider>
        <div class="template-content">
          <pre>{{ previewTemplate.content }}</pre>
        </div>

        <el-divider>变量说明</el-divider>
        <el-table :data="previewTemplate.variables" border>
          <el-table-column prop="name" label="变量名" width="150">
            <template #default="{ row }">
              {'{'{ row.name + '}'}}'}
            </template>
          </el-table-column>
          <el-table-column prop="label" label="说明" />
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column label="必填" width="80">
            <template #default="{ row }">
              <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                {{ row.required ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, Search, RefreshLeft, Document, Check,
  Message, Warning, ArrowDown
} from '@element-plus/icons-vue'
import { mockMessageTemplates } from '@/mock/message'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const tableData = ref<any[]>([])
const previewVisible = ref(false)
const previewTemplate = ref<any>({})

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  businessType: '',
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
  const total = mockMessageTemplates.length
  const active = mockMessageTemplates.filter(item => item.status === 'active').length
  const usage = mockMessageTemplates.reduce((sum, item) => sum + item.usageCount, 0)
  const pending = 0 // 模拟待审核数量

  return { total, active, usage, pending }
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

// 获取业务类型文本
const getBusinessTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    order_created: '订单创建',
    payment_success: '支付成功',
    order_shipped: '发货通知',
    password_reset: '密码重置',
    promotion: '促销活动'
  }
  return textMap[type] || type
}

// 截断内容
const truncateContent = (content: string, length: number) => {
  if (content.length <= length) return content
  return content.substring(0, length) + '...'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 筛选数据
    let filteredData = [...mockMessageTemplates]

    if (searchForm.name) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }

    if (searchForm.type) {
      filteredData = filteredData.filter(item => item.type === searchForm.type)
    }

    if (searchForm.businessType) {
      filteredData = filteredData.filter(item => item.businessType === searchForm.businessType)
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

// 创建模板
const handleCreate = () => {
  router.push('/system/message-templates/create')
}

// 编辑模板
const handleEdit = (row: any) => {
  router.push(`/system/message-templates/edit/${row.id}`)
}

// 预览模板
const handlePreview = (row: any) => {
  previewTemplate.value = row
  previewVisible.value = true
}

// 状态切换
const handleStatusChange = async (row: any) => {
  const action = row.status === 'active' ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(
      `确认${action}模板"${row.name}"吗？`,
      `${action}确认`,
      {
        type: 'warning'
      }
    )
    ElMessage.success(`模板已${action}`)
  } catch {
    // 用户取消，恢复原状态
    row.status = row.status === 'active' ? 'inactive' : 'active'
  }
}

// 处理下拉菜单命令
const handleCommand = (command: string, row: any) => {
  switch (command) {
    case 'copy':
      handleCopyTemplate(row)
      break
    case 'export':
      handleExportTemplate(row)
      break
    case 'delete':
      handleDeleteTemplate(row)
      break
  }
}

// 复制模板
const handleCopyTemplate = (row: any) => {
  ElMessage.success(`复制模板: ${row.name}`)
  router.push(`/system/message-templates/create?copy=${row.id}`)
}

// 导出模板
const handleExportTemplate = (row: any) => {
  ElMessage.success(`导出模板: ${row.name}`)
}

// 删除模板
const handleDeleteTemplate = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确认删除模板"${row.name}"吗？删除后不可恢复。`,
      '删除确认',
      {
        type: 'error'
      }
    )

    // 模拟API调用
    const index = mockMessageTemplates.findIndex(item => item.id === row.id)
    if (index > -1) {
      mockMessageTemplates.splice(index, 1)
    }

    ElMessage.success('模板已删除')
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
.message-template-list {
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

.content-preview {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.variables {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.more-variables {
  color: #909399;
  font-size: 12px;
  margin-left: 5px;
}

.no-variables {
  color: #c0c4cc;
  font-size: 14px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.preview-content {
  max-height: 600px;
  overflow-y: auto;
}

.template-content {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
<template>
  <div class="inventory-alert">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>库存预警</h2>
      <div class="actions">
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出预警
        </el-button>
      </div>
    </div>

    <!-- 预警统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card error">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32"><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ alertStats.error }}</div>
              <div class="stat-title">严重预警</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card warning">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ alertStats.warning }}</div>
              <div class="stat-title">警告预警</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card info">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32"><InfoFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ alertStats.info }}</div>
              <div class="stat-title">信息预警</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card resolved">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32"><Select /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ alertStats.resolved }}</div>
              <div class="stat-title">已处理</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入商品名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="商品编码">
          <el-input
            v-model="searchForm.productCode"
            placeholder="请输入商品编码"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="预警类型">
          <el-select
            v-model="searchForm.alertType"
            placeholder="请选择预警类型"
            clearable
            style="width: 150px"
          >
            <el-option label="库存偏低" value="low_stock" />
            <el-option label="已售罄" value="out_of_stock" />
            <el-option label="库存积压" value="overstock" />
            <el-option label="周转缓慢" value="slow_moving" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警级别">
          <el-select
            v-model="searchForm.alertLevel"
            placeholder="请选择预警级别"
            clearable
            style="width: 120px"
          >
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warning" />
            <el-option label="错误" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="未处理" value="unresolved" />
            <el-option label="已处理" value="resolved" />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库">
          <el-select
            v-model="searchForm.warehouse"
            placeholder="请选择仓库"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in warehouses"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预警时间">
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

    <!-- 预警列表 -->
    <el-card>
      <!-- 批量操作 -->
      <div class="batch-actions">
        <el-button
          type="danger"
          :disabled="selectedRows.length === 0"
          @click="handleBatchProcess"
        >
          批量处理
        </el-button>
        <el-button
          type="info"
          :disabled="selectedRows.length === 0"
          @click="handleBatchIgnore"
        >
          批量忽略
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="预警级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlertLevelType(row.alertLevel)" size="small">
              {{ getAlertLevelText(row.alertLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预警类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getAlertTypeType(row.alertType)" size="small">
              {{ getAlertTypeText(row.alertType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-name">{{ row.productName }}</div>
              <div class="product-meta">
                <span class="code">编码: {{ row.productCode }}</span>
                <span class="warehouse">仓库: {{ row.warehouse }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="当前库存" width="120" align="right">
          <template #default="{ row }">
            <span :class="getStockClass(row)">{{ row.currentStock }}</span>
          </template>
        </el-table-column>
        <el-table-column label="参考值" width="120" align="right">
          <template #default="{ row }">
            <div v-if="row.safetyStock">
              <div>安全: {{ row.safetyStock }}</div>
              <div v-if="row.maxStock">最高: {{ row.maxStock }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="预计可售天数" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row.daysOfSupply !== undefined" :class="getDaysClass(row)">
              {{ row.daysOfSupply }}天
            </span>
            <span v-else-if="row.avgDailySales">
              {{ calculateDays(row) }}天
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="avgDailySales" label="日均销量" width="100" align="right" />
        <el-table-column label="预警描述" min-width="250">
          <template #default="{ row }">
            <div class="alert-desc">{{ row.description }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="alertTime" label="预警时间" width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'resolved' ? 'success' : 'danger'" size="small">
              {{ row.status === 'resolved' ? '已处理' : '未处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'unresolved'"
              type="primary"
              size="small"
              @click="handleProcessAlert(row)"
            >
              处理
            </el-button>
            <el-button type="info" size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 'unresolved'"
              type="warning"
              size="small"
              @click="handleIgnoreAlert(row)"
            >
              忽略
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

    <!-- 处理预警对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      title="处理预警"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="processFormRef" :model="processForm" :rules="processRules" label-width="100px">
        <el-form-item label="预警信息">
          <el-alert
            :title="currentAlert?.title"
            :description="currentAlert?.description"
            :type="getAlertLevelType(currentAlert?.alertLevel)"
            show-icon
            :closable="false"
          />
        </el-form-item>
        <el-form-item label="处理方式" prop="action">
          <el-radio-group v-model="processForm.action">
            <el-radio value="replenish">补充库存</el-radio>
            <el-radio value="transfer">库存调拨</el-radio>
            <el-radio value="promotion">促销处理</el-radio>
            <el-radio value="other">其他处理</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明" prop="remark">
          <el-input
            v-model="processForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入处理说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmProcess">确认处理</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, Download, Search, RefreshLeft, CircleClose, Warning,
  InfoFilled, Select
} from '@element-plus/icons-vue'
import { mockInventoryAlerts } from '@/mock/inventory'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const tableData = ref<any[]>([])
const selectedRows = ref<any[]>([])
const processDialogVisible = ref(false)
const currentAlert = ref<any>(null)
const processFormRef = ref()

// 搜索表单
const searchForm = reactive({
  productName: '',
  productCode: '',
  alertType: '',
  alertLevel: '',
  status: '',
  warehouse: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 处理表单
const processForm = reactive({
  action: '',
  remark: ''
})

// 表单验证规则
const processRules = {
  action: [
    { required: true, message: '请选择处理方式', trigger: 'change' }
  ],
  remark: [
    { required: true, message: '请输入处理说明', trigger: 'blur' }
  ]
}

// 仓库选项
const warehouses = ['华东仓', '华南仓', '华北仓', '西南仓', '海外仓']

// 预警统计
const alertStats = computed(() => {
  const stats = {
    error: 0,
    warning: 0,
    info: 0,
    resolved: 0
  }

  mockInventoryAlerts.forEach(alert => {
    if (alert.status === 'resolved') {
      stats.resolved++
    } else {
      stats[alert.alertLevel]++
    }
  })

  return stats
})

// 获取预警级别类型
const getAlertLevelType = (level: string) => {
  const typeMap: Record<string, string> = {
    info: 'info',
    warning: 'warning',
    error: 'danger'
  }
  return typeMap[level] || 'info'
}

// 获取预警级别文本
const getAlertLevelText = (level: string) => {
  const textMap: Record<string, string> = {
    info: '信息',
    warning: '警告',
    error: '错误'
  }
  return textMap[level] || '未知'
}

// 获取预警类型类型
const getAlertTypeType = (type: string) => {
  const typeMap: Record<string, string> = {
    low_stock: 'warning',
    out_of_stock: 'danger',
    overstock: 'info',
    slow_moving: 'warning'
  }
  return typeMap[type] || 'info'
}

// 获取预警类型文本
const getAlertTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    low_stock: '库存偏低',
    out_of_stock: '已售罄',
    overstock: '库存积压',
    slow_moving: '周转缓慢'
  }
  return textMap[type] || '未知'
}

// 获取库存样式类
const getStockClass = (row: any) => {
  if (row.currentStock === 0) return 'stock-out'
  if (row.currentStock <= (row.safetyStock || 0)) return 'stock-warning'
  return 'stock-normal'
}

// 获取预计天数样式类
const getDaysClass = (row: any) => {
  if (row.daysOfSupply <= 3) return 'days-critical'
  if (row.daysOfSupply <= 7) return 'days-warning'
  return 'days-normal'
}

// 计算预计天数
const calculateDays = (row: any) => {
  if (!row.avgDailySales || row.avgDailySales <= 0) return '∞'
  if (row.currentStock <= 0) return 0
  return Math.floor(row.currentStock / row.avgDailySales)
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 筛选数据
    let filteredData = [...mockInventoryAlerts]

    if (searchForm.productName) {
      filteredData = filteredData.filter(item =>
        item.productName.toLowerCase().includes(searchForm.productName.toLowerCase())
      )
    }

    if (searchForm.productCode) {
      filteredData = filteredData.filter(item =>
        item.productCode.toLowerCase().includes(searchForm.productCode.toLowerCase())
      )
    }

    if (searchForm.alertType) {
      filteredData = filteredData.filter(item => item.alertType === searchForm.alertType)
    }

    if (searchForm.alertLevel) {
      filteredData = filteredData.filter(item => item.alertLevel === searchForm.alertLevel)
    }

    if (searchForm.status) {
      filteredData = filteredData.filter(item => item.status === searchForm.status)
    }

    if (searchForm.warehouse) {
      filteredData = filteredData.filter(item => item.warehouse === searchForm.warehouse)
    }

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      const [startDate, endDate] = searchForm.dateRange
      filteredData = filteredData.filter(item => {
        const alertDate = item.alertTime.split(' ')[0]
        return alertDate >= startDate && alertDate <= endDate
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

// 导出
const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

// 多选
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 处理预警
const handleProcessAlert = (row: any) => {
  currentAlert.value = row
  processForm.action = ''
  processForm.remark = ''
  processDialogVisible.value = true
}

// 确认处理
const handleConfirmProcess = async () => {
  if (!processFormRef.value) return

  try {
    await processFormRef.value.validate()

    // 模拟API调用
    currentAlert.value.status = 'resolved'

    ElMessage.success('预警处理成功')
    processDialogVisible.value = false
    loadData()
  } catch (error) {
    // 表单验证失败
  }
}

// 忽略预警
const handleIgnoreAlert = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认忽略该预警吗？', '提示', {
      type: 'warning'
    })

    // 模拟API调用
    row.status = 'resolved'
    ElMessage.success('预警已忽略')
    loadData()
  } catch {
    // 用户取消
  }
}

// 批量处理
const handleBatchProcess = async () => {
  try {
    await ElMessageBox.confirm(`确认处理选中的 ${selectedRows.value.length} 条预警吗？`, '批量处理', {
      type: 'warning'
    })

    // 模拟API调用
    selectedRows.value.forEach(row => {
      if (row.status === 'unresolved') {
        row.status = 'resolved'
      }
    })

    ElMessage.success(`成功处理 ${selectedRows.value.length} 条预警`)
    selectedRows.value = []
    loadData()
  } catch {
    // 用户取消
  }
}

// 批量忽略
const handleBatchIgnore = async () => {
  try {
    await ElMessageBox.confirm(`确认忽略选中的 ${selectedRows.value.length} 条预警吗？`, '批量忽略', {
      type: 'warning'
    })

    // 模拟API调用
    selectedRows.value.forEach(row => {
      if (row.status === 'unresolved') {
        row.status = 'resolved'
      }
    })

    ElMessage.success(`成功忽略 ${selectedRows.value.length} 条预警`)
    selectedRows.value = []
    loadData()
  } catch {
    // 用户取消
  }
}

// 查看详情
const handleViewDetail = (row: any) => {
  router.push(`/system/inventory/detail/${row.inventoryId}?tab=alerts`)
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
.inventory-alert {
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

.stat-card.error {
  border-left: 4px solid #f56c6c;
}

.stat-card.warning {
  border-left: 4px solid #e6a23c;
}

.stat-card.info {
  border-left: 4px solid #409eff;
}

.stat-card.resolved {
  border-left: 4px solid #67c23a;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  margin-right: 16px;
}

.stat-icon.error {
  color: #f56c6c;
}

.stat-icon.warning {
  color: #e6a23c;
}

.stat-icon.info {
  color: #409eff;
}

.stat-icon.resolved {
  color: #67c23a;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: #909399;
}

.search-card {
  margin-bottom: 20px;
}

.batch-actions {
  margin-bottom: 10px;
}

.product-info {
  line-height: 1.4;
}

.product-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.product-meta {
  font-size: 12px;
  color: #909399;
}

.product-meta .code,
.product-meta .warehouse {
  margin-right: 10px;
}

.alert-desc {
  line-height: 1.4;
  color: #606266;
}

.stock-normal {
  color: #67c23a;
  font-weight: 500;
}

.stock-warning {
  color: #e6a23c;
  font-weight: 500;
}

.stock-out {
  color: #f56c6c;
  font-weight: 500;
}

.days-normal {
  color: #67c23a;
}

.days-warning {
  color: #e6a23c;
}

.days-critical {
  color: #f56c6c;
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
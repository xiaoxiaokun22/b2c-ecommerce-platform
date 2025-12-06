<template>
  <div class="inventory-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/system/inventory' }">库存管理</el-breadcrumb-item>
        <el-breadcrumb-item>库存详情</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="header-actions">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <div v-loading="loading">
      <!-- 商品基本信息 -->
      <el-card class="product-info-card">
        <template #header>
          <div class="card-header">
            <span>商品基本信息</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="商品编码">
                {{ inventoryInfo.productCode }}
              </el-descriptions-item>
              <el-descriptions-item label="商品名称">
                {{ inventoryInfo.productName }}
              </el-descriptions-item>
              <el-descriptions-item label="商品分类">
                {{ inventoryInfo.category }}
              </el-descriptions-item>
              <el-descriptions-item label="品牌">
                {{ inventoryInfo.brand }}
              </el-descriptions-item>
              <el-descriptions-item label="规格">
                {{ formatSpecifications(inventoryInfo.specifications) }}
              </el-descriptions-item>
              <el-descriptions-item label="仓库">
                {{ inventoryInfo.warehouse }}
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="12">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="当前库存">
                <span :class="getStockClass(inventoryInfo)">
                  {{ inventoryInfo.currentStock }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="可用库存">
                {{ inventoryInfo.availableStock }}
              </el-descriptions-item>
              <el-descriptions-item label="锁定库存">
                {{ inventoryInfo.lockedStock }}
              </el-descriptions-item>
              <el-descriptions-item label="安全库存">
                {{ inventoryInfo.safetyStock }}
              </el-descriptions-item>
              <el-descriptions-item label="最大库存">
                {{ inventoryInfo.maxStock }}
              </el-descriptions-item>
              <el-descriptions-item label="库存状态">
                <el-tag :type="getStatusType(inventoryInfo.stockStatus)">
                  {{ getStatusText(inventoryInfo.stockStatus) }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>

      <!-- 库存统计图表 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>库存趋势</span>
            <el-radio-group v-model="chartPeriod" size="small" @change="handlePeriodChange">
              <el-radio-button label="7">7天</el-radio-button>
              <el-radio-button label="30">30天</el-radio-button>
              <el-radio-button label="90">90天</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div id="stockChart" style="height: 300px;"></div>
      </el-card>

      <!-- 选项卡内容 -->
      <el-card class="tab-card">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <!-- 批次管理 -->
          <el-tab-pane label="批次管理" name="batches">
            <el-table :data="batchData" border>
              <el-table-column prop="batchNo" label="批次号" width="150" />
              <el-table-column prop="quantity" label="批次数量" width="120" align="right" />
              <el-table-column prop="remainingQuantity" label="剩余数量" width="120" align="right">
                <template #default="{ row }">
                  <span :class="row.remainingQuantity === 0 ? 'text-danger' : ''">
                    {{ row.remainingQuantity }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="productionDate" label="生产日期" width="120" />
              <el-table-column prop="expiryDate" label="到期日期" width="120" />
              <el-table-column prop="supplier" label="供应商" />
              <el-table-column prop="purchasePrice" label="采购价" width="120" align="right">
                <template #default="{ row }">
                  ¥{{ row.purchasePrice.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getBatchStatusType(row.status)">
                    {{ getBatchStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="location" label="库位" width="120" />
              <el-table-column prop="inTime" label="入库时间" width="160" />
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="handleViewBatchDetail(row)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- 变动记录 -->
          <el-tab-pane label="变动记录" name="records">
            <div class="tab-header">
              <el-form :model="recordForm" inline>
                <el-form-item label="变动类型">
                  <el-select v-model="recordForm.type" placeholder="全部" clearable style="width: 150px">
                    <el-option label="入库" value="inbound" />
                    <el-option label="出库" value="outbound" />
                    <el-option label="调整" value="adjust" />
                    <el-option label="调拨" value="transfer" />
                    <el-option label="报损" value="loss" />
                  </el-select>
                </el-form-item>
                <el-form-item label="时间范围">
                  <el-date-picker
                    v-model="recordForm.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="loadStockRecords">查询</el-button>
                  <el-button @click="resetRecordForm">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <el-table :data="recordData" border>
              <el-table-column prop="id" label="记录编号" width="150" />
              <el-table-column label="变动类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getRecordTypeColor(row.type)">
                    {{ getRecordTypeText(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="changeQuantity" label="变动数量" width="120" align="right">
                <template #default="{ row }">
                  <span :class="row.changeQuantity > 0 ? 'text-success' : 'text-danger'">
                    {{ row.changeQuantity > 0 ? '+' : '' }}{{ row.changeQuantity }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="beforeStock" label="变动前库存" width="120" align="right" />
              <el-table-column prop="afterStock" label="变动后库存" width="120" align="right" />
              <el-table-column prop="reason" label="变动原因" width="150" />
              <el-table-column prop="batchNo" label="批次号" width="150" />
              <el-table-column prop="supplier" label="供应商" />
              <el-table-column prop="operator" label="操作人" width="100" />
              <el-table-column prop="operatorTime" label="操作时间" width="160" />
              <el-table-column prop="remark" label="备注" />
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="recordPagination.current"
                v-model:page-size="recordPagination.pageSize"
                :page-sizes="[10, 20, 50]"
                :total="recordPagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleRecordSizeChange"
                @current-change="handleRecordCurrentChange"
              />
            </div>
          </el-tab-pane>

          <!-- 库存预警 -->
          <el-tab-pane label="预警信息" name="alerts">
            <el-alert
              v-if="inventoryInfo.stockStatus === 'warning' || inventoryInfo.stockStatus === 'low'"
              :title="`当前库存${inventoryInfo.currentStock}件，${inventoryInfo.currentStock <= inventoryInfo.safetyStock ? '低于' : '接近'}安全库存`"
              type="warning"
              show-icon
              :closable="false"
            />

            <el-table :data="alertData" border style="margin-top: 10px;">
              <el-table-column prop="alertType" label="预警类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="getAlertTypeColor(row.alertType)">
                    {{ getAlertTypeText(row.alertType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="alertLevel" label="预警级别" width="100">
                <template #default="{ row }">
                  <el-tag :type="getAlertLevelType(row.alertLevel)">
                    {{ getAlertLevelText(row.alertLevel) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="title" label="预警标题" />
              <el-table-column prop="description" label="预警描述" />
              <el-table-column prop="currentStock" label="当前库存" width="100" align="right" />
              <el-table-column prop="daysOfSupply" label="可售天数" width="100" align="right" />
              <el-table-column prop="alertTime" label="预警时间" width="160" />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'resolved' ? 'success' : 'danger'">
                    {{ row.status === 'resolved' ? '已处理' : '未处理' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button
                    v-if="row.status === 'unresolved'"
                    type="primary"
                    size="small"
                    @click="handleResolveAlert(row)"
                  >
                    处理
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { ArrowLeft } from '@element-plus/icons-vue'
import {
  mockInventoryList,
  mockStockRecords,
  mockInventoryBatches,
  mockInventoryAlerts
} from '@/mock/inventory'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const inventoryInfo = ref<any>({})
const activeTab = ref('batches')
const chartPeriod = ref('30')
const stockChart = ref<echarts.ECharts | null>(null)

// 批次数据
const batchData = ref<any[]>([])

// 变动记录数据
const recordData = ref<any[]>([])
const recordForm = reactive({
  type: '',
  dateRange: []
})
const recordPagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 预警数据
const alertData = ref<any[]>([])

// 格式化规格信息
const formatSpecifications = (specs: any) => {
  if (!specs) return ''
  return Object.values(specs).join(' / ')
}

// 获取库存数量样式类
const getStockClass = (info: any) => {
  if (info.currentStock === 0) return 'stock-out'
  if (info.currentStock <= info.safetyStock) return 'stock-warning'
  return 'stock-normal'
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    normal: 'success',
    low: 'warning',
    warning: 'danger',
    out_of_stock: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    normal: '正常',
    low: '偏低',
    warning: '警告',
    out_of_stock: '售罄'
  }
  return textMap[status] || '未知'
}

// 获取批次状态类型
const getBatchStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'success',
    expired: 'danger',
    sold_out: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取批次状态文本
const getBatchStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '有效',
    expired: '已过期',
    sold_out: '已售罄'
  }
  return textMap[status] || '未知'
}

// 获取记录类型颜色
const getRecordTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    inbound: 'success',
    outbound: 'danger',
    adjust: 'warning',
    transfer: 'info',
    loss: 'danger'
  }
  return colorMap[type] || 'info'
}

// 获取记录类型文本
const getRecordTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    inbound: '入库',
    outbound: '出库',
    adjust: '调整',
    transfer: '调拨',
    loss: '报损'
  }
  return textMap[type] || '未知'
}

// 获取预警类型颜色
const getAlertTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    low_stock: 'warning',
    out_of_stock: 'danger',
    overstock: 'info',
    slow_moving: 'warning'
  }
  return colorMap[type] || 'info'
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

// 初始化图表
const initChart = () => {
  nextTick(() => {
    const chartDom = document.getElementById('stockChart')
    if (chartDom) {
      stockChart.value = echarts.init(chartDom)
      updateChart()
    }
  })
}

// 更新图表
const updateChart = () => {
  if (!stockChart.value) return

  const days = parseInt(chartPeriod.value)
  const dates = []
  const stockData = []

  // 生成模拟数据
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }))

    // 模拟库存变动
    const baseStock = inventoryInfo.value.currentStock || 100
    const randomChange = Math.floor(Math.random() * 20) - 10
    stockData.push(baseStock + randomChange)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['库存数量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '库存数量',
      type: 'line',
      smooth: true,
      data: stockData,
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(64, 158, 255, 0.3)'
          }, {
            offset: 1,
            color: 'rgba(64, 158, 255, 0.1)'
          }]
        }
      }
    }]
  }

  stockChart.value.setOption(option)
}

// 加载库存详情
const loadInventoryDetail = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    const id = route.params.id as string
    const inventory = mockInventoryList.find(item => item.id === id)

    if (inventory) {
      inventoryInfo.value = inventory
    } else {
      ElMessage.error('库存信息不存在')
      router.push('/system/inventory')
      return
    }

    // 加载批次数据
    batchData.value = mockInventoryBatches.filter(item => item.inventoryId === id)

    // 加载变动记录
    loadStockRecords()

    // 加载预警信息
    alertData.value = mockInventoryAlerts.filter(item => item.inventoryId === id)

  } catch (error) {
    ElMessage.error('加载库存详情失败')
  } finally {
    loading.value = false
  }
}

// 加载变动记录
const loadStockRecords = async () => {
  const id = route.params.id as string
  let filteredRecords = mockStockRecords.filter(item => item.inventoryId === id)

  // 应用筛选
  if (recordForm.type) {
    filteredRecords = filteredRecords.filter(item => item.type === recordForm.type)
  }

  if (recordForm.dateRange && recordForm.dateRange.length === 2) {
    const [startDate, endDate] = recordForm.dateRange
    filteredRecords = filteredRecords.filter(item => {
      const recordDate = item.operatorTime.split(' ')[0]
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  recordPagination.total = filteredRecords.length
  const start = (recordPagination.current - 1) * recordPagination.pageSize
  const end = start + recordPagination.pageSize
  recordData.value = filteredRecords.slice(start, end)
}

// 重置记录筛选
const resetRecordForm = () => {
  recordForm.type = ''
  recordForm.dateRange = []
  recordPagination.current = 1
  loadStockRecords()
}

// 处理图表周期变化
const handlePeriodChange = () => {
  updateChart()
}

// 处理选项卡切换
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  if (tabName === 'batches') {
    // 重新初始化图表（如果需要）
  }
}

// 返回列表
const handleBack = () => {
  router.back()
}

// 查看批次详情
const handleViewBatchDetail = (row: any) => {
  ElMessage.info(`查看批次 ${row.batchNo} 详情`)
}

// 处理预警
const handleResolveAlert = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认处理该预警吗？', '提示', {
      type: 'warning'
    })

    // 模拟API调用
    row.status = 'resolved'
    ElMessage.success('预警已处理')
  } catch {
    // 用户取消
  }
}

// 记录分页事件
const handleRecordSizeChange = (size: number) => {
  recordPagination.pageSize = size
  loadStockRecords()
}

const handleRecordCurrentChange = (current: number) => {
  recordPagination.current = current
  loadStockRecords()
}

// 初始化
onMounted(() => {
  loadInventoryDetail()
  initChart()
})
</script>

<style scoped>
.inventory-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.product-info-card {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.tab-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tab-header {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
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

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
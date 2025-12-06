<template>
  <div class="inventory-analysis">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>库存分析</h2>
      <div class="actions">
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出报表
        </el-button>
      </div>
    </div>

    <!-- 概览卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon total">
              <el-icon size="24"><Box /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ analysisData.overview.totalSKUs }}</div>
              <div class="card-label">总SKU数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon value">
              <el-icon size="24"><Money /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">¥{{ formatMoney(analysisData.overview.totalStockValue) }}</div>
              <div class="card-label">库存总价值</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon turnover">
              <el-icon size="24"><TrendCharts /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ analysisData.overview.avgInventoryTurnover }}x</div>
              <div class="card-label">平均周转率</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon alert">
              <el-icon size="24"><Warning /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ analysisData.overview.lowStockProducts }}</div>
              <div class="card-label">预警商品数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="时间范围">
          <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
            <el-radio-button label="7">近7天</el-radio-button>
            <el-radio-button label="30">近30天</el-radio-button>
            <el-radio-button label="90">近90天</el-radio-button>
            <el-radio-button label="custom">自定义</el-radio-button>
          </el-radio-group>
          <el-date-picker
            v-if="timeRange === 'custom'"
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="margin-left: 10px"
          />
        </el-form-item>
        <el-form-item label="仓库">
          <el-select
            v-model="filterForm.warehouse"
            placeholder="全部仓库"
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
        <el-form-item label="商品分类">
          <el-select
            v-model="filterForm.category"
            placeholder="全部分类"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in categories"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <!-- 库存周转趋势 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>库存周转趋势</span>
              <el-radio-group v-model="turnoverChartPeriod" size="small">
                <el-radio-button label="month">按月</el-radio-button>
                <el-radio-button label="week">按周</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div id="turnoverChart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 分类库存分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>分类库存分布</span>
          </template>
          <div id="categoryChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-section">
      <!-- 库存状态分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>库存状态分布</span>
          </template>
          <div id="statusChart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 仓库库存分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>仓库库存分布</span>
          </template>
          <div id="warehouseChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card class="table-section">
      <template #header>
        <el-tabs v-model="activeTableTab">
          <el-tab-pane label="滞销商品分析" name="slowMoving"></el-tab-pane>
          <el-tab-pane label="库存变动统计" name="stockChange"></el-tab-pane>
        </el-tabs>
      </template>

      <!-- 滞销商品 -->
      <div v-if="activeTableTab === 'slowMoving'">
        <el-table :data="slowMovingProducts" border>
          <el-table-column prop="productCode" label="商品编码" width="120" />
          <el-table-column prop="productName" label="商品名称" min-width="200" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="currentStock" label="当前库存" width="100" align="right" />
          <el-table-column prop="lastSaleDate" label="最后销售日期" width="120" />
          <el-table-column prop="daysSinceLastSale" label="滞销天数" width="100" align="right">
            <template #default="{ row }">
              <span :class="getSlowMovingClass(row.daysSinceLastSale)">
                {{ row.daysSinceLastSale }}天
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="avgDailySales" label="日均销量" width="100" align="right" />
          <el-table-column prop="stockValue" label="库存价值" width="120" align="right">
            <template #default="{ row }">
              ¥{{ formatMoney(row.stockValue) }}
            </template>
          </el-table-column>
          <el-table-column prop="recommendation" label="处理建议" min-width="200" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleProcessSlowMoving(row)">
                处理
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 库存变动统计 -->
      <div v-if="activeTableTab === 'stockChange'">
        <el-row :gutter="20" style="margin-bottom: 20px">
          <el-col :span="6">
            <div class="stat-item">
              <span class="label">总入库量:</span>
              <span class="value text-success">{{ stockChangeStats.totalInbound }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <span class="label">总出库量:</span>
              <span class="value text-danger">{{ stockChangeStats.totalOutbound }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <span class="label">库存调整:</span>
              <span class="value" :class="stockChangeStats.totalAdjust >= 0 ? 'text-success' : 'text-danger'">
                {{ stockChangeStats.totalAdjust }}
              </span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <span class="label">库存调拨:</span>
              <span class="value text-info">{{ stockChangeStats.totalTransfer }}</span>
            </div>
          </el-col>
        </el-row>

        <el-table :data="stockChangeRecords" border>
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="inbound" label="入库" width="100" align="right">
            <template #default="{ row }">
              <span class="text-success">{{ row.inbound || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="outbound" label="出库" width="100" align="right">
            <template #default="{ row }">
              <span class="text-danger">{{ row.outbound || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="adjust" label="调整" width="100" align="right">
            <template #default="{ row }">
              <span :class="row.adjust >= 0 ? 'text-success' : 'text-danger'">
                {{ row.adjust || '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="transfer" label="调拨" width="100" align="right">
            <template #default="{ row }">
              <span class="text-info">{{ row.transfer || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="netChange" label="净变动" width="100" align="right">
            <template #default="{ row }">
              <span :class="row.netChange >= 0 ? 'text-success' : 'text-danger'">
                {{ row.netChange >= 0 ? '+' : '' }}{{ row.netChange }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="endStock" label="期末库存" width="120" align="right" />
          <el-table-column prop="turnover" label="周转率" width="100" align="right">
            <template #default="{ row }">
              {{ row.turnover }}x
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh, Download, Box, Money, TrendCharts, Warning
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { mockInventoryAnalysis } from '@/mock/inventory'

// 响应式数据
const loading = ref(false)
const timeRange = ref('30')
const activeTableTab = ref('slowMoving')
const turnoverChartPeriod = ref('month')

// 图表实例
let turnoverChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null
let warehouseChart: echarts.ECharts | null = null

// 分析数据
const analysisData = ref(mockInventoryAnalysis)

// 筛选表单
const filterForm = reactive({
  dateRange: [],
  warehouse: '',
  category: ''
})

// 仓库和分类选项
const warehouses = ['华东仓', '华南仓', '华北仓', '西南仓', '海外仓']
const categories = ['手机数码', '电脑办公', '家用电器', '影音娱乐', '其他']

// 滞销商品数据
const slowMovingProducts = ref(mockInventoryAnalysis.slowMovingProducts)

// 库存变动统计
const stockChangeStats = ref(mockInventoryAnalysis.stockChangeStats)

// 库存变动记录（模拟数据）
const stockChangeRecords = ref([
  {
    date: '2024-01-10',
    inbound: 156,
    outbound: 89,
    adjust: -8,
    transfer: 0,
    netChange: 59,
    endStock: 12589,
    turnover: 4.5
  },
  {
    date: '2024-01-09',
    inbound: 234,
    outbound: 201,
    adjust: 0,
    transfer: 50,
    netChange: 83,
    endStock: 12530,
    turnover: 4.6
  },
  {
    date: '2024-01-08',
    inbound: 189,
    outbound: 267,
    adjust: -15,
    transfer: 0,
    netChange: -93,
    endStock: 12447,
    turnover: 4.4
  }
])

// 格式化金额
const formatMoney = (value: number) => {
  return (value / 10000).toFixed(1) + '万'
}

// 获取滞销天数样式类
const getSlowMovingClass = (days: number) => {
  if (days >= 60) return 'text-danger'
  if (days >= 30) return 'text-warning'
  return ''
}

// 初始化库存周转趋势图
const initTurnoverChart = () => {
  const chartDom = document.getElementById('turnoverChart')
  if (chartDom) {
    turnoverChart = echarts.init(chartDom)
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['周转率']
      },
      xAxis: {
        type: 'category',
        data: analysisData.value.turnoverTrend.map(item => item.month)
      },
      yAxis: {
        type: 'value',
        name: '周转率'
      },
      series: [{
        name: '周转率',
        type: 'line',
        smooth: true,
        data: analysisData.value.turnoverTrend.map(item => item.turnover),
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
    turnoverChart.setOption(option)
  }
}

// 初始化分类库存分布图
const initCategoryChart = () => {
  const chartDom = document.getElementById('categoryChart')
  if (chartDom) {
    categoryChart = echarts.init(chartDom)
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}万元 ({d}%)'
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: analysisData.value.categoryDistribution.map(item => ({
          value: item.stockValue / 10000,
          name: item.category
        }))
      }]
    }
    categoryChart.setOption(option)
  }
}

// 初始化库存状态分布图
const initStatusChart = () => {
  const chartDom = document.getElementById('statusChart')
  if (chartDom) {
    statusChart = echarts.init(chartDom)
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}个 ({d}%)'
      },
      series: [{
        type: 'pie',
        radius: '60%',
        data: analysisData.value.stockStatusDistribution.map(item => ({
          value: item.count,
          name: item.status
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    }
    statusChart.setOption(option)
  }
}

// 初始化仓库库存分布图
const initWarehouseChart = () => {
  const chartDom = document.getElementById('warehouseChart')
  if (chartDom) {
    warehouseChart = echarts.init(chartDom)
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: analysisData.value.warehouseDistribution.map(item => item.warehouse)
      },
      yAxis: {
        type: 'value',
        name: '库存价值(万元)'
      },
      series: [{
        type: 'bar',
        data: analysisData.value.warehouseDistribution.map(item => ({
          value: item.stockValue / 10000,
          name: item.warehouse
        })),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }]
    }
    warehouseChart.setOption(option)
  }
}

// 处理时间范围变化
const handleTimeRangeChange = () => {
  // 根据时间范围更新数据
  loadData()
}

// 刷新数据
const handleRefresh = () => {
  loadData()
  ElMessage.success('数据已刷新')
}

// 导出报表
const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

// 处理滞销商品
const handleProcessSlowMoving = (row: any) => {
  ElMessage.info(`处理滞销商品: ${row.productName}`)
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    // 这里可以根据筛选条件重新加载数据
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    initTurnoverChart()
    initCategoryChart()
    initStatusChart()
    initWarehouseChart()
  })
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
  turnoverChart?.resize()
  categoryChart?.resize()
  statusChart?.resize()
  warehouseChart?.resize()
}

// 初始化
onMounted(() => {
  loadData()
  initCharts()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  turnoverChart?.dispose()
  categoryChart?.dispose()
  statusChart?.dispose()
  warehouseChart?.dispose()
})
</script>

<style scoped>
.inventory-analysis {
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

.overview-cards {
  margin-bottom: 20px;
}

.overview-card {
  height: 100px;
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.card-icon.total {
  background-color: #e6f7ff;
  color: #1890ff;
}

.card-icon.value {
  background-color: #f6ffed;
  color: #52c41a;
}

.card-icon.turnover {
  background-color: #fff7e6;
  color: #fa8c16;
}

.card-icon.alert {
  background-color: #fff1f0;
  color: #f5222d;
}

.card-info {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.card-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.filter-card {
  margin-bottom: 20px;
}

.chart-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-section {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-item .label {
  display: block;
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-item .value {
  font-size: 20px;
  font-weight: 600;
}

.text-success {
  color: #67c23a;
}

.text-warning {
  color: #e6a23c;
}

.text-danger {
  color: #f56c6c;
}

.text-info {
  color: #409eff;
}
</style>
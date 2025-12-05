<template>
  <div class="order-statistics">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>订单统计分析</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportStatistics">
          <el-icon><Download /></el-icon>
          导出报表
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="overview-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-item">
              <div class="card-icon total">
                <el-icon><Document /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-value">{{ statistics.totalOrders.toLocaleString() }}</div>
                <div class="card-label">总订单数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-item">
              <div class="card-icon today">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-value">{{ statistics.todayOrders.toLocaleString() }}</div>
                <div class="card-label">今日订单</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-item">
              <div class="card-icon amount">
                <el-icon><Money /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-value">￥{{ statistics.todayAmount.toFixed(2) }}</div>
                <div class="card-label">今日金额</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-item">
              <div class="card-icon pending">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-value">{{ statistics.pendingShipmentCount.toLocaleString() }}</div>
                <div class="card-label">待发货</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 订单状态分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <h3>订单状态分布</h3>
              <el-radio-group v-model="statusChartType" size="small">
                <el-radio-button value="count">订单数量</el-radio-button>
                <el-radio-button value="amount">订单金额</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="statusChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 支付方式分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <h3>支付方式分布</h3>
              <el-radio-group v-model="paymentChartType" size="small">
                <el-radio-button value="count">订单数量</el-radio-button>
                <el-radio-button value="amount">订单金额</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="paymentChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图表 -->
    <el-card class="chart-card">
      <template #header>
        <div class="chart-header">
          <h3>订单趋势分析</h3>
          <el-radio-group v-model="trendPeriod" size="small">
            <el-radio-button value="7">近7天</el-radio-button>
            <el-radio-button value="30">近30天</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div ref="trendChartRef" class="chart-container large"></div>
    </el-card>

    <!-- 详细统计表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <h3>详细统计数据</h3>
          <div class="table-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateChange"
            />
          </div>
        </div>
      </template>

      <!-- 订单状态统计表格 -->
      <div class="statistics-section">
        <h4>订单状态统计</h4>
        <el-table :data="statusTableData" border>
          <el-table-column prop="status" label="订单状态" width="150">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="count" label="订单数量" width="120" />
          <el-table-column prop="amount" label="订单金额" width="150">
            <template #default="{ row }">
              ￥{{ row.amount.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="percentage" label="占比" width="100">
            <template #default="{ row }">
              {{ row.percentage.toFixed(1) }}%
            </template>
          </el-table-column>
          <el-table-column label="趋势" width="200">
            <template #default="{ row }">
              <div class="trend-bar">
                <div class="trend-fill" :style="{ width: `${row.percentage}%` }"></div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 支付方式统计表格 -->
      <div class="statistics-section">
        <h4>支付方式统计</h4>
        <el-table :data="paymentTableData" border>
          <el-table-column prop="method" label="支付方式" width="150">
            <template #default="{ row }">
              <el-tag :type="getPaymentMethodType(row.method)">
                {{ getPaymentMethodLabel(row.method) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="count" label="订单数量" width="120" />
          <el-table-column prop="amount" label="订单金额" width="150">
            <template #default="{ row }">
              ￥{{ row.amount.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="percentage" label="占比" width="100">
            <template #default="{ row }">
              {{ row.percentage.toFixed(1) }}%
            </template>
          </el-table-column>
          <el-table-column label="趋势" width="200">
            <template #default="{ row }">
              <div class="trend-bar">
                <div class="trend-fill" :style="{ width: `${row.percentage}%` }"></div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 每日统计数据 -->
      <div class="statistics-section">
        <h4>每日订单统计</h4>
        <el-table :data="dailyTableData" border max-height="400">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="orderCount" label="订单数量" width="120" />
          <el-table-column prop="amount" label="订单金额" width="150">
            <template #default="{ row }">
              ￥{{ row.amount.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="avgAmount" label="平均客单价" width="150">
            <template #default="{ row }">
              ￥{{ (row.amount / row.orderCount).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="增长率" width="120">
            <template #default="{ row, $index }">
              <span v-if="$index === 0" class="text-gray-500">-</span>
              <span v-else :class="getGrowthRateClass(row, dailyTableData[$index - 1])">
                {{ calculateGrowthRate(row, dailyTableData[$index - 1]) }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Refresh, Document, Calendar, Money, Clock } from '@element-plus/icons-vue'
import { statisticsApi } from '@/api/order'
import { OrderStatus, PaymentMethod, type OrderStatistics } from '@/types/order'
import * as echarts from 'echarts'

// 统计数据
const statistics = ref<OrderStatistics>({
  totalOrders: 0,
  todayOrders: 0,
  todayAmount: 0,
  pendingPaymentCount: 0,
  pendingShipmentCount: 0,
  exceptionCount: 0,
  refundingCount: 0,
  statusDistribution: [],
  paymentMethodDistribution: [],
  dailyTrend: []
})

// 图表配置
const statusChartType = ref('count')
const paymentChartType = ref('count')
const trendPeriod = ref('30')
const dateRange = ref<[string, string] | null>(null)

// 图表实例
let statusChart: echarts.ECharts | null = null
let paymentChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

// DOM引用
const statusChartRef = ref<HTMLDivElement>()
const paymentChartRef = ref<HTMLDivElement>()
const trendChartRef = ref<HTMLDivElement>()

// 表格数据
const statusTableData = ref<any[]>([])
const paymentTableData = ref<any[]>([])
const dailyTableData = ref<any[]>([])

// 获取统计数据
const getStatistics = async () => {
  try {
    const response = await statisticsApi.getOrderStatistics()
    if (response.code === 200) {
      statistics.value = response.data
      updateTableData()
      await nextTick()
      renderCharts()
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    ElMessage.error('获取统计数据失败')
  }
}

// 更新表格数据
const updateTableData = () => {
  // 订单状态表格数据
  const totalStatusCount = statistics.value.statusDistribution.reduce((sum, item) => sum + item.count, 0)
  statusTableData.value = statistics.value.statusDistribution.map(item => ({
    status: item.status,
    count: item.count,
    amount: item.amount,
    percentage: totalStatusCount > 0 ? (item.count / totalStatusCount) * 100 : 0
  }))

  // 支付方式表格数据
  const totalPaymentCount = statistics.value.paymentMethodDistribution.reduce((sum, item) => sum + item.count, 0)
  paymentTableData.value = statistics.value.paymentMethodDistribution.map(item => ({
    method: item.method,
    count: item.count,
    amount: item.amount,
    percentage: totalPaymentCount > 0 ? (item.count / totalPaymentCount) * 100 : 0
  }))

  // 每日统计数据
  dailyTableData.value = statistics.value.dailyTrend.slice(-30).reverse()
}

// 渲染图表
const renderCharts = () => {
  renderStatusChart()
  renderPaymentChart()
  renderTrendChart()
}

// 渲染订单状态分布图
const renderStatusChart = () => {
  if (!statusChartRef.value) return

  if (statusChart) {
    statusChart.dispose()
  }

  statusChart = echarts.init(statusChartRef.value)

  const data = statistics.value.statusDistribution.map(item => ({
    name: getStatusLabel(item.status),
    value: statusChartType.value === 'count' ? item.count : item.amount
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const value = statusChartType.value === 'count' ? params.value : `￥${params.value.toFixed(2)}`
        return `${params.name}: ${value} (${params.percent}%)`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: statusChartType.value === 'count' ? '订单数量' : '订单金额',
        type: 'pie',
        radius: '50%',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  statusChart.setOption(option)
}

// 渲染支付方式分布图
const renderPaymentChart = () => {
  if (!paymentChartRef.value) return

  if (paymentChart) {
    paymentChart.dispose()
  }

  paymentChart = echarts.init(paymentChartRef.value)

  const data = statistics.value.paymentMethodDistribution.map(item => ({
    name: getPaymentMethodLabel(item.method),
    value: paymentChartType.value === 'count' ? item.count : item.amount
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const value = paymentChartType.value === 'count' ? params.value : `￥${params.value.toFixed(2)}`
        return `${params.name}: ${value} (${params.percent}%)`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: paymentChartType.value === 'count' ? '订单数量' : '订单金额',
        type: 'pie',
        radius: '50%',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  paymentChart.setOption(option)
}

// 渲染趋势图
const renderTrendChart = () => {
  if (!trendChartRef.value) return

  if (trendChart) {
    trendChart.dispose()
  }

  trendChart = echarts.init(trendChartRef.value)

  const days = parseInt(trendPeriod.value)
  const trendData = statistics.value.dailyTrend.slice(-days)

  const dates = trendData.map(item => item.date)
  const orderCounts = trendData.map(item => item.orderCount)
  const amounts = trendData.map(item => item.amount)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['订单数量', '订单金额']
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '订单数量',
        position: 'left'
      },
      {
        type: 'value',
        name: '订单金额(元)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '订单数量',
        type: 'bar',
        data: orderCounts,
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '订单金额',
        type: 'line',
        yAxisIndex: 1,
        data: amounts,
        itemStyle: {
          color: '#91cc75'
        },
        smooth: true
      }
    ]
  }

  trendChart.setOption(option)
}

// 监听图表类型变化
watch([statusChartType, paymentChartType, trendPeriod], () => {
  renderCharts()
})

// 刷新数据
const refreshData = () => {
  getStatistics()
}

// 日期范围变化
const handleDateChange = () => {
  // 这里可以根据日期范围重新获取数据
  ElMessage.info('日期筛选功能开发中...')
}

// 导出统计
const exportStatistics = () => {
  ElMessage.info('导出功能开发中...')
}

// 计算增长率
const calculateGrowthRate = (current: any, previous: any) => {
  if (!previous || previous.orderCount === 0) return '+0.0%'

  const rate = ((current.orderCount - previous.orderCount) / previous.orderCount) * 100
  return (rate >= 0 ? '+' : '') + rate.toFixed(1) + '%'
}

// 获取增长率样式类
const getGrowthRateClass = (current: any, previous: any) => {
  if (!previous || previous.orderCount === 0) return 'text-gray-500'

  const rate = ((current.orderCount - previous.orderCount) / previous.orderCount) * 100
  return rate > 0 ? 'text-green-500' : rate < 0 ? 'text-red-500' : 'text-gray-500'
}

// 获取状态标签
const getStatusLabel = (status: OrderStatus) => {
  const statusMap = {
    [OrderStatus.PENDING_PAYMENT]: '待付款',
    [OrderStatus.PENDING_REVIEW]: '待审核',
    [OrderStatus.PENDING_SHIPMENT]: '待发货',
    [OrderStatus.SHIPPED]: '已发货',
    [OrderStatus.DELIVERED]: '已收货',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消',
    [OrderStatus.REFUNDING]: '退款中',
    [OrderStatus.REFUNDED]: '已退款',
    [OrderStatus.EXCEPTION]: '异常订单'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态类型
const getStatusType = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING_PAYMENT:
      return 'warning'
    case OrderStatus.PENDING_REVIEW:
      return 'info'
    case OrderStatus.PENDING_SHIPMENT:
      return ''
    case OrderStatus.SHIPPED:
      return 'success'
    case OrderStatus.DELIVERED:
      return 'success'
    case OrderStatus.COMPLETED:
      return 'success'
    case OrderStatus.CANCELLED:
      return 'danger'
    case OrderStatus.REFUNDING:
      return 'warning'
    case OrderStatus.REFUNDED:
      return 'info'
    case OrderStatus.EXCEPTION:
      return 'danger'
    default:
      return 'info'
  }
}

// 获取支付方式标签
const getPaymentMethodLabel = (method: PaymentMethod) => {
  const methodMap = {
    [PaymentMethod.ALIPAY]: '支付宝',
    [PaymentMethod.WECHAT]: '微信支付',
    [PaymentMethod.BALANCE]: '余额支付',
    [PaymentMethod.BANK_CARD]: '银行卡'
  }
  return methodMap[method] || '未知方式'
}

// 获取支付方式类型
const getPaymentMethodType = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.ALIPAY:
      return 'primary'
    case PaymentMethod.WECHAT:
      return 'success'
    case PaymentMethod.BALANCE:
      return 'warning'
    case PaymentMethod.BANK_CARD:
      return 'info'
    default:
      return 'info'
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getStatistics()
})

// 窗口大小变化时重新渲染图表
window.addEventListener('resize', () => {
  statusChart?.resize()
  paymentChart?.resize()
  trendChart?.resize()
})
</script>

<style scoped>
.order-statistics {
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
}

.header-actions {
  display: flex;
  gap: 12px;
}

.overview-cards {
  margin-bottom: 20px;
}

.overview-card {
  height: 120px;
}

.card-item {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.card-icon.total {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.card-icon.today {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.card-icon.amount {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.card-icon.pending {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.card-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3 {
  margin: 0;
}

.chart-container {
  height: 320px;
}

.chart-container.large {
  height: 400px;
}

.table-card {
  margin-top: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h3 {
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 12px;
}

.statistics-section {
  margin-bottom: 30px;
}

.statistics-section h4 {
  margin-bottom: 16px;
  color: #303133;
  font-size: 16px;
}

.trend-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.trend-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  transition: width 0.3s ease;
}

.text-gray-500 {
  color: #909399;
}

.text-green-500 {
  color: #67c23a;
}

.text-red-500 {
  color: #f56c6c;
}
</style>
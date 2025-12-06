<template>
  <div class="payment-statistics">
    <div class="page-header">
      <div class="header-content">
        <h2>支付统计分析</h2>
        <p>支付数据统计分析和趋势监控</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 时间筛选 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="统计周期">
          <el-radio-group v-model="filterForm.period" @change="handlePeriodChange">
            <el-radio-button label="today">今日</el-radio-button>
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="custom">自定义</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="日期范围" v-if="filterForm.period === 'custom'">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 260px"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item label="支付渠道">
          <el-select v-model="filterForm.paymentChannel" placeholder="请选择" clearable style="width: 150px">
            <el-option label="全部渠道" value="" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wechat" />
            <el-option label="银联支付" value="unionpay" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 总览统计卡片 -->
    <div class="overview-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card total">
            <div class="card-icon">
              <el-icon><Money /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">总交易额</div>
              <div class="card-value">¥{{ overview.totalAmount.toLocaleString() }}</div>
              <div class="card-trend" :class="getTrendClass(overview.amountTrend)">
                {{ formatTrend(overview.amountTrend) }}
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card count">
            <div class="card-icon">
              <el-icon><List /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">总交易笔数</div>
              <div class="card-value">{{ overview.totalCount.toLocaleString() }}</div>
              <div class="card-trend" :class="getTrendClass(overview.countTrend)">
                {{ formatTrend(overview.countTrend) }}
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card success">
            <div class="card-icon">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">成功率</div>
              <div class="card-value">{{ (overview.successRate * 100).toFixed(1) }}%</div>
              <div class="card-trend" :class="getTrendClass(overview.successRateTrend)">
                {{ formatTrend(overview.successRateTrend) }}
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card average">
            <div class="card-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">平均交易额</div>
              <div class="card-value">¥{{ overview.averageAmount.toLocaleString() }}</div>
              <div class="card-trend" :class="getTrendClass(overview.averageTrend)">
                {{ formatTrend(overview.averageTrend) }}
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 交易趋势图 -->
        <el-col :span="16">
          <div class="chart-card">
            <div class="chart-header">
              <h3>交易趋势</h3>
              <el-radio-group v-model="chartMetric" size="small">
                <el-radio-button label="amount">交易额</el-radio-button>
                <el-radio-button label="count">交易笔数</el-radio-button>
                <el-radio-button label="success_rate">成功率</el-radio-button>
              </el-radio-group>
            </div>
            <div class="chart-content" ref="trendChartRef"></div>
          </div>
        </el-col>
        <!-- 渠道分布图 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-header">
              <h3>渠道分布</h3>
            </div>
            <div class="chart-content" ref="channelChartRef"></div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <!-- 支付方式分布 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-header">
              <h3>支付方式分布</h3>
            </div>
            <div class="chart-content" ref="methodChartRef"></div>
          </div>
        </el-col>
        <!-- 风险等级分布 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-header">
              <h3>风险等级分布</h3>
            </div>
            <div class="chart-content" ref="riskChartRef"></div>
          </div>
        </el-col>
        <!-- 小时交易分布 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-header">
              <h3>24小时交易分布</h3>
            </div>
            <div class="chart-content" ref="hourlyChartRef"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 详细数据表格 -->
    <div class="table-section">
      <div class="table-header">
        <h3>详细数据</h3>
        <el-radio-group v-model="tableType" size="small">
          <el-radio-button label="daily">按日统计</el-radio-button>
          <el-radio-button label="channel">渠道统计</el-radio-button>
          <el-radio-button label="method">支付方式统计</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 按日统计表格 -->
      <el-table
        v-if="tableType === 'daily'"
        :data="dailyStats"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="totalCount" label="交易笔数" width="120">
          <template #default="{ row }">
            <span class="count-number">{{ row.totalCount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="交易金额" width="150">
          <template #default="{ row }">
            <span class="amount-number">¥{{ row.totalAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="successCount" label="成功笔数" width="120" />
        <el-table-column prop="successAmount" label="成功金额" width="150">
          <template #default="{ row }">
            <span class="success-amount">¥{{ row.successAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="failedCount" label="失败笔数" width="120">
          <template #default="{ row }">
            <span class="failed-count">{{ (row.failedCount || 0).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="successRate" label="成功率" width="100">
          <template #default="{ row }">
            <span :class="getSuccessRateClass(row.successRate)">
              {{ ((row.successRate || 0) * 100).toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="averageAmount" label="平均金额" width="120">
          <template #default="{ row }">
            ¥{{ (row.averageAmount || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 渠道统计表格 -->
      <el-table
        v-if="tableType === 'channel'"
        :data="channelStats"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="channel" label="支付渠道" width="150" />
        <el-table-column prop="count" label="交易笔数" width="120">
          <template #default="{ row }">
            <span class="count-number">{{ row.count.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="交易金额" width="150">
          <template #default="{ row }">
            <span class="amount-number">¥{{ row.amount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="successRate" label="成功率" width="100">
          <template #default="{ row }">
            <span :class="getSuccessRateClass(row.successRate)">
              {{ ((row.successRate || 0) * 100).toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="averageAmount" label="平均金额" width="120">
          <template #default="{ row }">
            ¥{{ (row.averageAmount || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="占比" width="100">
          <template #default="{ row }">
            {{ ((row.amount || 0) / (overview.totalAmount || 1) * 100).toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column label="趋势" width="200">
          <template #default="{ row }">
            <div class="trend-indicators">
              <el-icon v-if="row.trend === 'up'" class="trend-up"><CaretTop /></el-icon>
              <el-icon v-else-if="row.trend === 'down'" class="trend-down"><CaretBottom /></el-icon>
              <el-icon v-else class="trend-stable"><Minus /></el-icon>
              <span>{{ row.trendText }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 支付方式统计表格 -->
      <el-table
        v-if="tableType === 'method'"
        :data="methodStats"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="method" label="支付方式" width="150" />
        <el-table-column prop="count" label="交易笔数" width="120">
          <template #default="{ row }">
            <span class="count-number">{{ row.count.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="交易金额" width="150">
          <template #default="{ row }">
            <span class="amount-number">¥{{ row.amount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="successRate" label="成功率" width="100">
          <template #default="{ row }">
            <span :class="getSuccessRateClass(row.successRate)">
              {{ ((row.successRate || 0) * 100).toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="averageAmount" label="平均金额" width="120">
          <template #default="{ row }">
            ¥{{ (row.averageAmount || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="占比" width="100">
          <template #default="{ row }">
            {{ ((row.amount || 0) / (overview.totalAmount || 1) * 100).toFixed(1) }}%
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Refresh, Money, List, SuccessFilled, TrendCharts, CaretTop, CaretBottom, Minus } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { paymentStatisticsApi } from '../../../api/payment'

// 响应式数据
const loading = ref(false)
const chartMetric = ref('amount')
const tableType = ref('daily')
const dateRange = ref<[string, string] | null>(null)

// 图表引用
const trendChartRef = ref<HTMLDivElement>()
const channelChartRef = ref<HTMLDivElement>()
const methodChartRef = ref<HTMLDivElement>()
const riskChartRef = ref<HTMLDivElement>()
const hourlyChartRef = ref<HTMLDivElement>()

// 图表实例
let trendChart: echarts.ECharts | null = null
let channelChart: echarts.ECharts | null = null
let methodChart: echarts.ECharts | null = null
let riskChart: echarts.ECharts | null = null
let hourlyChart: echarts.ECharts | null = null

// 筛选表单
const filterForm = reactive({
  period: 'week',
  paymentChannel: ''
})

// 总览数据
const overview = reactive({
  totalAmount: 2500000,
  amountTrend: 12.5,
  totalCount: 1250,
  countTrend: 8.3,
  successRate: 0.944,
  successRateTrend: -1.2,
  averageAmount: 2000,
  averageTrend: 3.8
})

// 详细数据
const dailyStats = ref<any[]>([])
const channelStats = ref<any[]>([])
const methodStats = ref<any[]>([])

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    import('../../../api/mock/payment').then(({ generateHistoricalStatistics, mockPaymentStatistics }) => {
      // 生成历史统计数据
      const days = filterForm.period === 'today' ? 1 :
                   filterForm.period === 'week' ? 7 :
                   filterForm.period === 'month' ? 30 : 30
      dailyStats.value = generateHistoricalStatistics(days)

      // 渠道统计数据
      channelStats.value = mockPaymentStatistics.channelStats.map((item, index) => ({
        ...item,
        trend: index % 3 === 0 ? 'up' : index % 3 === 1 ? 'down' : 'stable',
        trendText: index % 3 === 0 ? '较上期增长 8%' : index % 3 === 1 ? '较上期下降 3%' : '与上期持平'
      }))

      // 支付方式统计数据
      methodStats.value = mockPaymentStatistics.methodStats
    })
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const initCharts = async () => {
  await nextTick()

  // 初始化趋势图
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    updateTrendChart()
  }

  // 初始化渠道分布图
  if (channelChartRef.value) {
    channelChart = echarts.init(channelChartRef.value)
    updateChannelChart()
  }

  // 初始化支付方式分布图
  if (methodChartRef.value) {
    methodChart = echarts.init(methodChartRef.value)
    updateMethodChart()
  }

  // 初始化风险等级分布图
  if (riskChartRef.value) {
    riskChart = echarts.init(riskChartRef.value)
    updateRiskChart()
  }

  // 初始化小时交易分布图
  if (hourlyChartRef.value) {
    hourlyChart = echarts.init(hourlyChartRef.value)
    updateHourlyChart()
  }
}

const updateTrendChart = () => {
  if (!trendChart) return

  const dates = dailyStats.value.map(item => item.date)
  const amounts = dailyStats.value.map(item => item.totalAmount)
  const counts = dailyStats.value.map(item => item.totalCount)
  const successRates = dailyStats.value.map(item => item.successRate * 100)

  let series: any[] = []
  let yAxis: any = {}

  switch (chartMetric.value) {
    case 'amount':
      series = [{
        name: '交易额',
        type: 'line',
        data: amounts,
        smooth: true,
        areaStyle: { opacity: 0.3 }
      }]
      yAxis = { type: 'value', name: '金额 (元)' }
      break
    case 'count':
      series = [{
        name: '交易笔数',
        type: 'line',
        data: counts,
        smooth: true,
        areaStyle: { opacity: 0.3 }
      }]
      yAxis = { type: 'value', name: '笔数' }
      break
    case 'success_rate':
      series = [{
        name: '成功率',
        type: 'line',
        data: successRates,
        smooth: true,
        areaStyle: { opacity: 0.3 }
      }]
      yAxis = { type: 'value', name: '百分比 (%)', min: 90, max: 100 }
      break
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0]
        if (chartMetric.value === 'amount') {
          return `${param.name}<br/>${param.seriesName}: ¥${param.value.toLocaleString()}`
        } else if (chartMetric.value === 'count') {
          return `${param.name}<br/>${param.seriesName}: ${param.value.toLocaleString()}笔`
        } else {
          return `${param.name}<br/>${param.seriesName}: ${param.value.toFixed(1)}%`
        }
      }
    },
    xAxis: { type: 'category', data: dates },
    yAxis,
    series
  }

  trendChart.setOption(option)
}

const updateChannelChart = () => {
  if (!channelChart) return

  const data = channelStats.value.map(item => ({
    name: item.channel,
    value: item.amount
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '交易额',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: { show: false },
      data
    }]
  }

  channelChart.setOption(option)
}

const updateMethodChart = () => {
  if (!methodChart) return

  const data = methodStats.value.map(item => ({
    name: item.method,
    value: item.count
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}笔 ({d}%)'
    },
    series: [{
      name: '交易笔数',
      type: 'pie',
      radius: '70%',
      data
    }]
  }

  methodChart.setOption(option)
}

const updateRiskChart = () => {
  if (!riskChart) return

  const data = [
    { name: '低风险', value: 1185 },
    { name: '中风险', value: 50 },
    { name: '高风险', value: 15 }
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}笔 ({d}%)'
    },
    color: ['#67c23a', '#e6a23c', '#f56c6c'],
    series: [{
      name: '风险等级',
      type: 'pie',
      radius: '70%',
      data
    }]
  }

  riskChart.setOption(option)
}

const updateHourlyChart = () => {
  if (!hourlyChart) return

  import('../../../api/mock/payment').then(({ mockPaymentStatistics }) => {
    const hours = mockPaymentStatistics.hourlyStats.map(item => item.hour)
    const counts = mockPaymentStatistics.hourlyStats.map(item => item.count)

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}时<br/>交易笔数: {c}笔'
      },
      xAxis: {
        type: 'category',
        data: hours
      },
      yAxis: {
        type: 'value',
        name: '交易笔数'
      },
      series: [{
        name: '交易笔数',
        type: 'bar',
        data: counts,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }]
    }

    hourlyChart.setOption(option)
  })
}

const handlePeriodChange = () => {
  // 设置默认日期范围
  const today = new Date()
  let startDate = new Date()

  switch (filterForm.period) {
    case 'today':
      startDate = today
      break
    case 'week':
      startDate.setDate(today.getDate() - 7)
      break
    case 'month':
      startDate.setDate(today.getDate() - 30)
      break
  }

  dateRange.value = [
    startDate.toISOString().split('T')[0],
    today.toISOString().split('T')[0]
  ]

  loadData()
}

const handleDateRangeChange = () => {
  loadData()
}

const handleRefresh = () => {
  loadData()
  initCharts()
}

const handleExport = () => {
  ElMessage.info('导出统计报告功能')
}

const handleViewDetail = (row: any) => {
  ElMessage.info(`查看 ${row.date} 详细数据`)
}

// 辅助方法
const getTrendClass = (trend: number) => {
  if (trend > 0) return 'trend-up'
  if (trend < 0) return 'trend-down'
  return 'trend-stable'
}

const formatTrend = (trend: number) => {
  if (trend > 0) return `↑ ${Math.abs(trend)}%`
  if (trend < 0) return `↓ ${Math.abs(trend)}%`
  return '持平'
}

const getSuccessRateClass = (rate: number) => {
  if (rate >= 0.95) return 'success-rate-high'
  if (rate >= 0.90) return 'success-rate-medium'
  return 'success-rate-low'
}

// 窗口大小改变时重新绘制图表
const handleResize = () => {
  trendChart?.resize()
  channelChart?.resize()
  methodChart?.resize()
  riskChart?.resize()
  hourlyChart?.resize()
}

// 生命周期
onMounted(() => {
  loadData()
  initCharts()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  channelChart?.dispose()
  methodChart?.dispose()
  riskChart?.dispose()
  hourlyChart?.dispose()
})
</script>

<style scoped>
.payment-statistics {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.header-content h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-content p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.overview-section {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.stat-card.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.count {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-card.success {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-card.average {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.card-icon {
  font-size: 32px;
  margin-right: 16px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
}

.card-trend {
  font-size: 12px;
  opacity: 0.8;
}

.card-trend.trend-up {
  color: #67c23a;
}

.card-trend.trend-down {
  color: #f56c6c;
}

.card-trend.trend-stable {
  color: #909399;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-content {
  height: calc(100% - 50px);
}

.table-section {
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.count-number {
  color: #409eff;
  font-weight: bold;
}

.amount-number {
  color: #67c23a;
  font-weight: bold;
}

.success-amount {
  color: #67c23a;
  font-weight: bold;
}

.failed-count {
  color: #f56c6c;
  font-weight: bold;
}

.success-rate-high {
  color: #67c23a;
  font-weight: bold;
}

.success-rate-medium {
  color: #e6a23c;
  font-weight: bold;
}

.success-rate-low {
  color: #f56c6c;
  font-weight: bold;
}

.trend-indicators {
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.trend-stable {
  color: #909399;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}
</style>
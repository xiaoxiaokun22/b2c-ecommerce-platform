<template>
  <div class="message-statistics">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>消息统计分析</h2>
      <div class="actions">
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出报表
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 时间筛选 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="时间范围">
          <el-radio-group v-model="filterForm.timeRange" @change="handleTimeRangeChange">
            <el-radio-button value="today">今日</el-radio-button>
            <el-radio-button value="yesterday">昨日</el-radio-button>
            <el-radio-button value="week">近7天</el-radio-button>
            <el-radio-button value="month">近30天</el-radio-button>
            <el-radio-button value="custom">自定义</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="filterForm.timeRange === 'custom'" label="自定义时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="消息类型">
          <el-select
            v-model="filterForm.messageType"
            placeholder="请选择消息类型"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option label="短信" value="sms" />
            <el-option label="邮件" value="email" />
            <el-option label="站内信" value="in_app" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计概览 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6f7ff;">
              <el-icon size="24" color="#1890ff"><Message /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总发送量</div>
              <div class="stat-value">{{ overviewData.totalSent.toLocaleString() }}</div>
              <div class="stat-trend" :class="{ 'up': overviewData.sentTrend > 0, 'down': overviewData.sentTrend < 0 }">
                {{ formatTrend(overviewData.sentTrend) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f6ffed;">
              <el-icon size="24" color="#52c41a"><SuccessFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">成功率</div>
              <div class="stat-value">{{ overviewData.successRate }}%</div>
              <div class="stat-trend" :class="{ 'up': overviewData.successTrend > 0, 'down': overviewData.successTrend < 0 }">
                {{ formatTrend(overviewData.successTrend) }}
              </div>
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
              <div class="stat-value">{{ overviewData.avgTime }}ms</div>
              <div class="stat-trend" :class="{ 'up': overviewData.timeTrend > 0, 'down': overviewData.timeTrend < 0 }">
                {{ formatTrend(overviewData.timeTrend) }}
              </div>
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
              <div class="stat-value">¥{{ overviewData.totalCost }}</div>
              <div class="stat-trend" :class="{ 'up': overviewData.costTrend > 0, 'down': overviewData.costTrend < 0 }">
                {{ formatTrend(overviewData.costTrend) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <!-- 发送趋势图 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>发送趋势分析</span>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button value="hour">按小时</el-radio-button>
                <el-radio-button value="day">按天</el-radio-button>
                <el-radio-button value="week">按周</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 消息类型分布 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>消息类型分布</span>
          </template>
          <div ref="typeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 成本分析和渠道对比 -->
    <el-row :gutter="20" class="chart-section">
      <!-- 成本分析 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>成本分析</span>
          </template>
          <div ref="costChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 渠道对比 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>渠道效果对比</span>
          </template>
          <div ref="channelChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>详细数据</span>
          <el-button type="text" @click="handleExportDetail">
            <el-icon><Download /></el-icon>
            导出明细
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="detailData"
        style="width: 100%"
      >
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="消息类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.messageType)">
              {{ getTypeText(row.messageType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="templateName" label="模板名称" min-width="200" />
        <el-table-column prop="sentCount" label="发送量" width="100" align="right" />
        <el-table-column prop="successCount" label="成功量" width="100" align="right" />
        <el-table-column label="成功率" width="100" align="right">
          <template #default="{ row }">
            <span :class="getSuccessRateClass(row.successRate)">
              {{ row.successRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="failCount" label="失败量" width="100" align="right" />
        <el-table-column label="失败原因" width="150">
          <template #default="{ row }">
            <div v-if="row.failReasons.length > 0" class="fail-reasons">
              <el-tooltip
                v-for="reason in row.failReasons.slice(0, 2)"
                :key="reason.reason"
                :content="`${reason.count}条: ${reason.reason}`"
                placement="top"
              >
                <el-tag size="small" type="danger">{{ reason.reason }}</el-tag>
              </el-tooltip>
              <span v-if="row.failReasons.length > 2" class="more-reasons">
                +{{ row.failReasons.length - 2 }}
              </span>
            </div>
            <span v-else class="no-fail">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="avgTime" label="平均耗时" width="100" align="right">
          <template #default="{ row }">
            {{ row.avgTime }}ms
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="费用" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.cost }}
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
import { ref, reactive, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download, Refresh, Search, Message, SuccessFilled,
  Clock, Money
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { mockMessageStatistics } from '@/mock/message'

// 响应式数据
const loading = ref(false)
const trendChartRef = ref()
const typeChartRef = ref()
const costChartRef = ref()
const channelChartRef = ref()

// 图表实例
let trendChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null
let costChart: echarts.ECharts | null = null
let channelChart: echarts.ECharts | null = null

// 筛选表单
const filterForm = reactive({
  timeRange: 'week',
  dateRange: [],
  messageType: ''
})

// 图表时间范围
const chartTimeRange = ref('day')

// 概览数据
const overviewData = computed(() => {
  const data = mockMessageStatistics.overview
  return {
    totalSent: data.totalMessages || 0,
    sentTrend: 12.5, // 模拟趋势数据
    successRate: data.successRate || 0,
    successTrend: 2.3, // 模拟趋势数据
    avgTime: Math.round((data.avgDeliveryTime || 0) * 1000), // 转换为毫秒
    timeTrend: -5.6, // 模拟趋势数据
    totalCost: data.totalCost || 0,
    costTrend: 8.9 // 模拟趋势数据
  }
})

// 详细数据
const detailData = ref<any[]>([])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
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

// 获取成功率样式
const getSuccessRateClass = (rate: number) => {
  if (rate >= 95) return 'success-high'
  if (rate >= 90) return 'success-medium'
  return 'success-low'
}

// 格式化趋势
const formatTrend = (trend: number) => {
  const prefix = trend > 0 ? '+' : ''
  const unit = trend > 0 ? '↑' : trend < 0 ? '↓' : '→'
  return `${prefix}${trend}% ${unit}`
}

// 时间范围变化
const handleTimeRangeChange = () => {
  if (filterForm.timeRange !== 'custom') {
    filterForm.dateRange = []
  }
  loadData()
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 刷新
const handleRefresh = () => {
  loadData()
}

// 导出报表
const handleExport = () => {
  ElMessage.success('报表导出成功')
}

// 导出明细
const handleExportDetail = () => {
  ElMessage.success('明细导出成功')
}

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)

  // 使用发送趋势数据
  const data = mockMessageStatistics.sendTrend
  const xAxisData = data.map(item => item.date)
  const sentData = data.map(item => item.total)
  const successData = data.map(item => item.success)

  const option = {
    title: {
      text: '消息发送趋势',
      left: 'left',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['发送量', '成功量'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '发送量',
        type: 'line',
        data: sentData,
        smooth: true,
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: '成功量',
        type: 'line',
        data: successData,
        smooth: true,
        itemStyle: {
          color: '#52c41a'
        }
      }
    ]
  }

  trendChart.setOption(option)
}

// 初始化类型分布图
const initTypeChart = () => {
  if (!typeChartRef.value) return

  typeChart = echarts.init(typeChartRef.value)

  const data = mockMessageStatistics.messageTypeDistribution
  const option = {
    title: {
      text: '消息类型占比',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '消息类型',
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
        labelLine: {
          show: false
        },
        data: data.map(item => ({
          value: item.count,
          name: item.type
        }))
      }
    ]
  }

  typeChart.setOption(option)
}

// 初始化成本分析图
const initCostChart = () => {
  if (!costChartRef.value) return

  costChart = echarts.init(costChartRef.value)

  const data = mockMessageStatistics.costAnalysis.monthlyCost
  const option = {
    title: {
      text: '每日成本分析',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params: any) => {
        let result = `${params[0].name}<br/>`
        params.forEach((item: any) => {
          result += `${item.seriesName}: ¥${item.value}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['短信成本', '邮件成本', '站内信成本'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.month)
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '短信成本',
        type: 'bar',
        data: data.map(item => (item.cost * 0.8).toFixed(2)), // 模拟短信成本占比
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: '邮件成本',
        type: 'bar',
        data: data.map(item => (item.cost * 0.2).toFixed(2)), // 模拟邮件成本占比
        itemStyle: {
          color: '#52c41a'
        }
      },
      {
        name: '站内信成本',
        type: 'bar',
        data: data.map(item => 0), // 站内信成本为0
        itemStyle: {
          color: '#fa8c16'
        }
      }
    ]
  }

  costChart.setOption(option)
}

// 初始化渠道对比图
const initChannelChart = () => {
  if (!channelChartRef.value) return

  channelChart = echarts.init(channelChartRef.value)

  const data = mockMessageStatistics.channelDistribution
  const option = {
    title: {
      text: '渠道效果对比',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['发送量', '成功率', '成本'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.channel)
    },
    yAxis: [
      {
        type: 'value',
        name: '发送量',
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '百分比(%)',
        position: 'right',
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: '发送量',
        type: 'bar',
        data: data.map(item => item.count),
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: '成功率',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => item.percentage),
        itemStyle: {
          color: '#52c41a'
        }
      },
      {
        name: '成本',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => (item.cost / 100).toFixed(2)), // 转换为百分比显示
        itemStyle: {
          color: '#fa8c16'
        }
      }
    ]
  }

  channelChart.setOption(option)
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 生成详细数据
    const mockDetailData = Array.from({ length: 100 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(index / 10))

      const messageTypes = ['sms', 'email', 'in_app']
      const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)]

      const sentCount = Math.floor(Math.random() * 1000) + 100
      const successRate = Math.floor(Math.random() * 15) + 85
      const successCount = Math.floor(sentCount * successRate / 100)
      const failCount = sentCount - successCount

      const failReasons = []
      if (failCount > 0) {
        const reasons = ['号码无效', '网络超时', '用户拒收', '模板错误', '余额不足']
        const count = Math.min(Math.floor(Math.random() * 3) + 1, failCount)
        for (let i = 0; i < count; i++) {
          failReasons.push({
            reason: reasons[Math.floor(Math.random() * reasons.length)],
            count: Math.floor(failCount / count)
          })
        }
      }

      return {
        id: index + 1,
        date: date.toISOString().split('T')[0],
        messageType,
        templateName: `模板${index + 1}`,
        sentCount,
        successCount,
        successRate,
        failCount,
        failReasons,
        avgTime: Math.floor(Math.random() * 500) + 100,
        cost: (sentCount * (Math.random() * 0.5 + 0.1)).toFixed(2)
      }
    })

    // 应用筛选
    let filteredData = mockDetailData
    if (filterForm.messageType) {
      filteredData = filteredData.filter(item => item.messageType === filterForm.messageType)
    }

    pagination.total = filteredData.length
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    detailData.value = filteredData.slice(start, end)

  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
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

// 窗口大小变化时重新调整图表
const handleResize = () => {
  trendChart?.resize()
  typeChart?.resize()
  costChart?.resize()
  channelChart?.resize()
}


// 初始化
onMounted(async () => {
  await loadData()

  nextTick(() => {
    initTrendChart()
    initTypeChart()
    initCostChart()
    initChannelChart()
  })

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  typeChart?.dispose()
  costChart?.dispose()
  channelChart?.dispose()
})
</script>

<style scoped>
.message-statistics {
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

.filter-card {
  margin-bottom: 20px;
}

.stats-overview {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
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
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-trend {
  font-size: 12px;
  color: #909399;
}

.stat-trend.up {
  color: #52c41a;
}

.stat-trend.down {
  color: #f5222d;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-container {
  height: 350px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fail-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.more-reasons {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.no-fail {
  color: #c0c4cc;
}

.success-high {
  color: #52c41a;
  font-weight: 600;
}

.success-medium {
  color: #fa8c16;
  font-weight: 600;
}

.success-low {
  color: #f5222d;
  font-weight: 600;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
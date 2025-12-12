<template>
  <div class="coupon-statistics">
    <!-- 页面标题 -->
    <div class="page-header">
      <h3>优惠券数据统计</h3>
      <el-button type="primary" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出报表
      </el-button>
    </div>

    <!-- 优惠券基本信息 -->
    <el-descriptions title="优惠券信息" :column="3" border>
      <el-descriptions-item label="优惠券名称">
        {{ coupon?.name }}
      </el-descriptions-item>
      <el-descriptions-item label="优惠券类型">
        <el-tag :type="getCouponTypeTag(coupon?.type)">
          {{ getCouponTypeText(coupon?.type) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="优惠券面额">
        {{ formatCouponValue(coupon) }}
      </el-descriptions-item>
      <el-descriptions-item label="发行总量">
        {{ coupon?.totalQuantity }} 张
      </el-descriptions-item>
      <el-descriptions-item label="领取时间">
        {{ coupon?.receiveStartTime }} 至 {{ coupon?.receiveEndTime }}
      </el-descriptions-item>
      <el-descriptions-item label="有效期">
        领取后 {{ coupon?.validDays }} 天
      </el-descriptions-item>
    </el-descriptions>

    <!-- 核心数据指标 -->
    <el-row :gutter="20" class="metrics-row">
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-content">
            <div class="metric-icon" style="background-color: #e6f7ff;">
              <el-icon size="24" color="#1890ff"><User /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-title">领取人数</div>
              <div class="metric-value">{{ statistics.receiveUserCount }}</div>
              <div class="metric-desc">独立用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-content">
            <div class="metric-icon" style="background-color: #f6ffed;">
              <el-icon size="24" color="#52c41a"><ShoppingCart /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-title">使用人数</div>
              <div class="metric-value">{{ statistics.useUserCount }}</div>
              <div class="metric-desc">独立用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-content">
            <div class="metric-icon" style="background-color: #fff7e6;">
              <el-icon size="24" color="#fa8c16"><Money /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-title">优惠总额</div>
              <div class="metric-value">¥{{ statistics.totalDiscount }}</div>
              <div class="metric-desc">累计优惠金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric-content">
            <div class="metric-icon" style="background-color: #f0f2f5;">
              <el-icon size="24" color="#8c8c8c"><TrendCharts /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-title">核销率</div>
              <div class="metric-value">{{ statistics.usageRate }}%</div>
              <div class="metric-desc">使用/领取比</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 领取趋势图 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>领取趋势</span>
              <el-radio-group v-model="receiveTrendPeriod" size="small">
                <el-radio-button label="7">近7天</el-radio-button>
                <el-radio-button label="30">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="receiveTrendChart"></div>
        </el-card>
      </el-col>

      <!-- 使用趋势图 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>使用趋势</span>
              <el-radio-group v-model="useTrendPeriod" size="small">
                <el-radio-button label="7">近7天</el-radio-button>
                <el-radio-button label="30">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="useTrendChart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 每小时领取分布 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>24小时领取分布</span>
          </template>
          <div class="chart-container" ref="hourlyDistributionChart"></div>
        </el-card>
      </el-col>

      <!-- 用户类型分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>用户类型分布</span>
          </template>
          <div class="chart-container" ref="userTypeChart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>使用记录</span>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              @change="handleDateChange"
            />
            <el-button type="primary" size="small" @click="loadUsageRecords">
              查询
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="usageRecords" v-loading="tableLoading">
        <el-table-column prop="userNo" label="用户编号" width="120" />
        <el-table-column prop="userName" label="用户昵称" width="150" />
        <el-table-column prop="userType" label="用户类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getUserTypeTag(row.userType)">
              {{ getUserTypeText(row.userType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="receiveTime" label="领取时间" width="160" />
        <el-table-column prop="useTime" label="使用时间" width="160" />
        <el-table-column prop="orderNo" label="订单编号" width="150" />
        <el-table-column prop="orderAmount" label="订单金额" width="120">
          <template #default="{ row }">
            ¥{{ row.orderAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="discountAmount" label="优惠金额" width="120">
          <template #default="{ row }">
            <span class="discount-amount">-¥{{ row.discountAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getRecordStatusType(row.status)">
              {{ getRecordStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.current"
          :page-size="pagination.pageSize"
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
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download, User, ShoppingCart, Money, TrendCharts
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// Props
interface Props {
  coupon: any
}
const props = defineProps<Props>()

// 统计数据
const statistics = reactive({
  receiveUserCount: 0,
  useUserCount: 0,
  totalDiscount: 0,
  usageRate: 0
})

// 图表相关
const receiveTrendPeriod = ref('7')
const useTrendPeriod = ref('30')
const receiveTrendChart = ref()
const useTrendChart = ref()
const hourlyDistributionChart = ref()
const userTypeChart = ref()

let receiveChartInstance: echarts.ECharts | null = null
let useChartInstance: echarts.ECharts | null = null
let hourlyChartInstance: echarts.ECharts | null = null
let userTypeChartInstance: echarts.ECharts | null = null

// 使用记录
const dateRange = ref<[Date, Date]>()
const usageRecords = ref<any[]>([])
const tableLoading = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 格式化优惠券面值
const formatCouponValue = (coupon: any) => {
  if (!coupon) return '-'
  if (coupon.type === 'full_reduction' || coupon.type === 'cash') {
    return `¥${coupon.denomination}`
  } else if (coupon.type === 'discount') {
    return `${coupon.denomination * 10}折`
  }
  return '-'
}

// 获取优惠券类型标签样式
const getCouponTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    full_reduction: 'success',
    discount: 'warning',
    cash: 'danger'
  }
  return tagMap[type] || 'info'
}

// 获取优惠券类型文本
const getCouponTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    full_reduction: '满减券',
    discount: '折扣券',
    cash: '现金券'
  }
  return textMap[type] || type
}

// 获取用户类型标签样式
const getUserTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    new: 'success',
    regular: 'primary',
    vip: 'warning'
  }
  return tagMap[type] || 'info'
}

// 获取用户类型文本
const getUserTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    new: '新用户',
    regular: '普通用户',
    vip: 'VIP用户'
  }
  return textMap[type] || type
}

// 获取记录状态类型
const getRecordStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    received: 'info',
    used: 'success',
    expired: 'warning'
  }
  return typeMap[status] || 'info'
}

// 获取记录状态文本
const getRecordStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    received: '已领取',
    used: '已使用',
    expired: '已过期'
  }
  return textMap[status] || status
}

// 初始化领取趋势图
const initReceiveTrendChart = () => {
  if (!receiveTrendChart.value) return

  receiveChartInstance = echarts.init(receiveTrendChart.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>领取量: {c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: generateDateRange(parseInt(receiveTrendPeriod.value))
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: generateRandomData(parseInt(receiveTrendPeriod.value), 50, 200),
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
          { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
        ])
      },
      itemStyle: {
        color: '#1890ff'
      }
    }]
  }

  receiveChartInstance.setOption(option)
}

// 初始化使用趋势图
const initUseTrendChart = () => {
  if (!useTrendChart.value) return

  useChartInstance = echarts.init(useTrendChart.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>使用量: {c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: generateDateRange(parseInt(useTrendPeriod.value))
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: generateRandomData(parseInt(useTrendPeriod.value), 20, 100),
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#52c41a' },
          { offset: 1, color: '#389e0d' }
        ])
      }
    }]
  }

  useChartInstance.setOption(option)
}

// 初始化24小时分布图
const initHourlyDistributionChart = () => {
  if (!hourlyDistributionChart.value) return

  hourlyChartInstance = echarts.init(hourlyDistributionChart.value)

  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const data = generateRandomData(24, 10, 100)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>领取量: {c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hours
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data,
      type: 'bar',
      itemStyle: {
        color: '#fa8c16'
      }
    }]
  }

  hourlyChartInstance.setOption(option)
}

// 初始化用户类型分布图
const initUserTypeChart = () => {
  if (!userTypeChart.value) return

  userTypeChartInstance = echarts.init(userTypeChart.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a}<br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '用户类型',
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
          fontSize: '20',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 335, name: '新用户', itemStyle: { color: '#52c41a' } },
        { value: 310, name: '普通用户', itemStyle: { color: '#1890ff' } },
        { value: 234, name: 'VIP用户', itemStyle: { color: '#fa8c16' } }
      ]
    }]
  }

  userTypeChartInstance.setOption(option)
}

// 生成日期范围
const generateDateRange = (days: number) => {
  const dates = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
  }
  return dates
}

// 生成随机数据
const generateRandomData = (count: number, min: number, max: number) => {
  return Array.from({ length: count }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  )
}

// 生成模拟统计数据
const generateStatistics = () => {
  statistics.receiveUserCount = 1234
  statistics.useUserCount = 856
  statistics.totalDiscount = 45678
  statistics.usageRate = 69.4
}

// 生成模拟使用记录
const generateUsageRecords = () => {
  const records = []
  const userTypes = ['new', 'regular', 'vip']
  const statuses = ['used', 'received', 'expired']

  for (let i = 0; i < 50; i++) {
    records.push({
      id: i + 1,
      userNo: `U${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`,
      userName: `用户${i + 1}`,
      userType: userTypes[Math.floor(Math.random() * userTypes.length)],
      receiveTime: `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      useTime: Math.random() > 0.3 ? `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : '-',
      orderNo: Math.random() > 0.3 ? `ORD${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}` : '-',
      orderAmount: Math.floor(Math.random() * 1000) + 100,
      discountAmount: Math.floor(Math.random() * 100) + 10,
      status: statuses[Math.floor(Math.random() * statuses.length)]
    })
  }

  pagination.total = records.length
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  usageRecords.value = records.slice(start, end)
}

// 加载使用记录
const loadUsageRecords = () => {
  tableLoading.value = true
  setTimeout(() => {
    generateUsageRecords()
    tableLoading.value = false
  }, 500)
}

// 日期范围改变
const handleDateChange = () => {
  pagination.current = 1
  loadUsageRecords()
}

// 分页事件
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadUsageRecords()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadUsageRecords()
}

// 导出报表
const handleExport = () => {
  ElMessage.success('报表导出功能开发中...')
}

// 监听领取趋势周期变化
watch(receiveTrendPeriod, () => {
  initReceiveTrendChart()
})

// 监听使用趋势周期变化
watch(useTrendPeriod, () => {
  initUseTrendChart()
})

// 初始化
onMounted(() => {
  generateStatistics()
  loadUsageRecords()

  nextTick(() => {
    initReceiveTrendChart()
    initUseTrendChart()
    initHourlyDistributionChart()
    initUserTypeChart()
  })

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    receiveChartInstance?.resize()
    useChartInstance?.resize()
    hourlyChartInstance?.resize()
    userTypeChartInstance?.resize()
  })
})
</script>

<style scoped>
.coupon-statistics {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 0;
  color: #303133;
}

.metrics-row {
  margin: 20px 0;
}

.metric-card {
  height: 120px;
}

.metric-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.metric-info {
  flex: 1;
}

.metric-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.metric-desc {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 2px;
}

.chart-row {
  margin: 20px 0;
}

.chart-container {
  height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.table-card {
  margin-top: 20px;
}

.discount-amount {
  color: #f56c6c;
  font-weight: 600;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

/* 描述列表样式 */
:deep(.el-descriptions) {
  margin-bottom: 20px;
}

:deep(.el-descriptions__title) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-descriptions__body) {
  background-color: #fafafa;
}

:deep(.el-descriptions-item__label) {
  font-weight: 500;
  color: #606266;
  background-color: #f5f7fa;
}

:deep(.el-descriptions-item__content) {
  color: #303133;
}
</style>
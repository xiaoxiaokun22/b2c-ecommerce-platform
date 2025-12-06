<template>
  <div class="marketing-analysis">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>营销数据分析</h2>
      <div class="actions">
        <el-button @click="handleRefresh">
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
            <div class="card-icon activities">
              <el-icon size="32"><Promotion /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ analysisData.overview.totalActivities }}</div>
              <div class="card-label">总活动数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon participants">
              <el-icon size="32"><User /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ formatNumber(analysisData.overview.totalParticipants) }}</div>
              <div class="card-label">参与人数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon sales">
              <el-icon size="32"><Money /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">¥{{ formatMoney(analysisData.overview.totalSales) }}</div>
              <div class="card-label">营销销售额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="card-content">
            <div class="card-icon roi">
              <el-icon size="32"><TrendCharts /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ analysisData.overview.avgROI }}</div>
              <div class="card-label">平均ROI</div>
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
        <el-form-item label="活动类型">
          <el-select
            v-model="filterForm.activityType"
            placeholder="全部类型"
            clearable
            style="width: 150px"
          >
            <el-option label="促销活动" value="promotion" />
            <el-option label="优惠券" value="coupon" />
            <el-option label="秒杀活动" value="seckill" />
            <el-option label="团购活动" value="group_buying" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            style="width: 120px"
          >
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <!-- 活动趋势图 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>活动效果趋势</span>
              <el-radio-group v-model="trendMetric" size="small">
                <el-radio-button label="participants">参与人数</el-radio-button>
                <el-radio-button label="sales">销售额</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div id="trendChart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 活动类型分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>活动类型分布</span>
          </template>
          <div id="typeDistributionChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-section">
      <!-- ROI分析 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>ROI趋势分析</span>
          </template>
          <div id="roiChart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 营销渠道效果 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>营销渠道效果</span>
          </template>
          <div id="channelChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card class="table-section">
      <template #header>
        <div class="card-header">
          <span>活动效果排行</span>
          <el-radio-group v-model="rankingType" size="small">
            <el-radio-button label="sales">销售额</el-radio-button>
            <el-radio-button label="roi">ROI</el-radio-button>
            <el-radio-button label="conversion">转化率</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table :data="topActivities" border>
        <el-table-column type="index" label="排名" width="60" align="center">
          <template #default="{ $index }">
            <span :class="getRankingClass($index)">
              {{ $index + 1 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="活动名称" min-width="200" />
        <el-table-column prop="type" label="活动类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">
              {{ getActivityTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="participants" label="参与人数" width="120" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.participants) }}
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销售额" width="150" align="right">
          <template #default="{ row }">
            ¥{{ formatMoney(row.sales) }}
          </template>
        </el-table-column>
        <el-table-column prop="roi" label="ROI" width="100" align="right">
          <template #default="{ row }">
            <span :class="getROIClass(row.roi)">{{ row.roi }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="conversionRate" label="转化率" width="120" align="right">
          <template #default="{ row }">
            <span :class="getConversionClass(row.conversionRate)">
              {{ row.conversionRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 用户参与分析 -->
    <el-card class="analysis-section">
      <template #header>
        <span>用户参与分析</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="analysis-item">
            <h4>新老用户占比</h4>
            <div id="userTypeChart" style="height: 250px;"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="analysis-item">
            <h4>用户参与频次</h4>
            <div class="frequency-stats">
              <div class="stat-item">
                <span class="label">平均参与频次:</span>
                <span class="value">{{ analysisData.userParticipation.avgParticipationFrequency }}次</span>
              </div>
              <div class="stat-item">
                <span class="label">参与率:</span>
                <span class="value">{{ analysisData.userParticipation.participationRate }}%</span>
              </div>
              <el-progress
                :percentage="analysisData.userParticipation.participationRate"
                :color="getProgressColor(analysisData.userParticipation.participationRate)"
                :stroke-width="10"
              />
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Refresh, Download, Promotion, User, Money, TrendCharts
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { mockMarketingAnalysis } from '@/mock/marketing'

const router = useRouter()

// 响应式数据
const timeRange = ref('30')
const trendMetric = ref('sales')
const rankingType = ref('sales')
const filterForm = reactive({
  dateRange: [],
  activityType: '',
  status: ''
})

// 分析数据
const analysisData = ref(mockMarketingAnalysis)

// 图表实例
let trendChart: echarts.ECharts | null = null
let typeDistributionChart: echarts.ECharts | null = null
let roiChart: echarts.ECharts | null = null
let channelChart: echarts.ECharts | null = null
let userTypeChart: echarts.ECharts | null = null

// 排行榜数据
const topActivities = computed(() => {
  let sorted = [...analysisData.value.topActivities]

  // 根据选择的指标排序
  if (rankingType.value === 'sales') {
    sorted.sort((a, b) => b.sales - a.sales)
  } else if (rankingType.value === 'roi') {
    sorted.sort((a, b) => b.roi - a.roi)
  } else if (rankingType.value === 'conversion') {
    sorted.sort((a, b) => b.conversionRate - a.conversionRate)
  }

  return sorted.slice(0, 10)
})

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

// 格式化金额
const formatMoney = (value: number) => {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + '万'
  }
  return value.toFixed(0)
}

// 获取排名样式类
const getRankingClass = (index: number) => {
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
  return 'rank-normal'
}

// 获取ROI样式类
const getROIClass = (roi: number) => {
  if (roi >= 5) return 'text-success'
  if (roi >= 3) return 'text-warning'
  return 'text-danger'
}

// 获取转化率样式类
const getConversionClass = (rate: number) => {
  if (rate >= 20) return 'text-success'
  if (rate >= 10) return 'text-warning'
  return 'text-danger'
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 70) return '#67c23a'
  if (percentage >= 40) return '#e6a23c'
  return '#f56c6c'
}

// 获取活动类型文本
const getActivityTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    promotion: '促销活动',
    seckill: '秒杀活动',
    group_buying: '团购活动'
  }
  return textMap[type] || type
}

// 初始化趋势图
const initTrendChart = () => {
  nextTick(() => {
    const chartDom = document.getElementById('trendChart')
    if (chartDom) {
      trendChart = echarts.init(chartDom)

      const data = analysisData.value.activityTrend
      let seriesData, yAxisName

      if (trendMetric.value === 'participants') {
        seriesData = data.map(item => item.participants)
        yAxisName = '参与人数'
      } else {
        seriesData = data.map(item => item.sales)
        yAxisName = '销售额'
      }

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.date)
        },
        yAxis: {
          type: 'value',
          name: yAxisName
        },
        series: [{
          name: yAxisName,
          type: 'line',
          smooth: true,
          data: seriesData,
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
      trendChart.setOption(option)
    }
  })
}

// 初始化活动类型分布图
const initTypeDistributionChart = () => {
  nextTick(() => {
    const chartDom = document.getElementById('typeDistributionChart')
    if (chartDom) {
      typeDistributionChart = echarts.init(chartDom)
      const data = analysisData.value.activityTypeDistribution

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}个 ({d}%)'
        },
        series: [{
          type: 'pie',
          radius: '60%',
          data: data.map(item => ({
            value: item.count,
            name: item.type
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
      typeDistributionChart.setOption(option)
    }
  })
}

// 初始化ROI趋势图
const initROIChart = () => {
  nextTick(() => {
    const chartDom = document.getElementById('roiChart')
    if (chartDom) {
      roiChart = echarts.init(chartDom)
      const data = analysisData.value.roiAnalysis.monthlyROI

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.month)
        },
        yAxis: {
          type: 'value',
          name: 'ROI'
        },
        series: [{
          name: 'ROI',
          type: 'bar',
          data: data.map(item => item.roi),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        }]
      }
      roiChart.setOption(option)
    }
  })
}

// 初始化渠道效果图
const initChannelChart = () => {
  nextTick(() => {
    const chartDom = document.getElementById('channelChart')
    if (chartDom) {
      channelChart = echarts.init(chartDom)
      const data = analysisData.value.channelEffectiveness

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: data.map(item => item.channel)
        },
        series: [
          {
            name: '曝光量',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: data.map(item => item.exposure)
          },
          {
            name: '点击率',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: data.map(item => item.clickRate * 1000) // 放大显示
          },
          {
            name: '转化率',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: data.map(item => item.conversionRate * 1000) // 放大显示
          }
        ]
      }
      channelChart.setOption(option)
    }
  })
}

// 初始化用户类型图
const initUserTypeChart = () => {
  nextTick(() => {
    const chartDom = document.getElementById('userTypeChart')
    if (chartDom) {
      userTypeChart = echarts.init(chartDom)
      const userParticipation = analysisData.value.userParticipation

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}人 ({d}%)'
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: userParticipation.newUsers, name: '新用户' },
            { value: userParticipation.returningUsers, name: '老用户' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
      userTypeChart.setOption(option)
    }
  })
}

// 处理时间范围变化
const handleTimeRangeChange = () => {
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

// 查看详情
const handleViewDetail = (row: any) => {
  ElMessage.info(`查看活动详情: ${row.name}`)
}

// 加载数据
const loadData = async () => {
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 500))
  // 这里可以根据筛选条件重新加载数据
}

// 初始化图表
const initCharts = () => {
  initTrendChart()
  initTypeDistributionChart()
  initROIChart()
  initChannelChart()
  initUserTypeChart()
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
  trendChart?.resize()
  typeDistributionChart?.resize()
  roiChart?.resize()
  channelChart?.resize()
  userTypeChart?.resize()
}

// 监听指标变化
watch(trendMetric, () => {
  initTrendChart()
})

watch(rankingType, () => {
  // 排行榜会自动更新
})

// 初始化
onMounted(() => {
  loadData()
  initCharts()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  typeDistributionChart?.dispose()
  roiChart?.dispose()
  channelChart?.dispose()
  userTypeChart?.dispose()
})
</script>

<style scoped>
.marketing-analysis {
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
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.card-icon.activities {
  background-color: #e6f7ff;
  color: #1890ff;
}

.card-icon.participants {
  background-color: #f6ffed;
  color: #52c41a;
}

.card-icon.sales {
  background-color: #fff7e6;
  color: #fa8c16;
}

.card-icon.roi {
  background-color: #f0f2f5;
  color: #8c8c8c;
}

.card-info {
  flex: 1;
}

.card-value {
  font-size: 28px;
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

.rank-first {
  color: #ffd700;
  font-weight: bold;
  font-size: 18px;
}

.rank-second {
  color: #c0c0c0;
  font-weight: bold;
}

.rank-third {
  color: #cd7f32;
  font-weight: bold;
}

.rank-normal {
  color: #303133;
}

.text-success {
  color: #67c23a;
  font-weight: 500;
}

.text-warning {
  color: #e6a23c;
  font-weight: 500;
}

.text-danger {
  color: #f56c6c;
  font-weight: 500;
}

.analysis-section {
  margin-bottom: 20px;
}

.analysis-item {
  padding: 20px;
}

.analysis-item h4 {
  margin: 0 0 15px 0;
  color: #303133;
  text-align: center;
}

.frequency-stats {
  padding: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.stat-item .label {
  color: #909399;
}

.stat-item .value {
  color: #303133;
  font-weight: 500;
}
</style>
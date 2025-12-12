<template>
  <div class="group-buying-detail">
    <!-- 活动基本信息 -->
    <el-descriptions title="活动信息" :column="3" border>
      <el-descriptions-item label="活动名称">
        {{ groupBuying?.name }}
      </el-descriptions-item>
      <el-descriptions-item label="活动商品">
        {{ groupBuying?.productName }}
      </el-descriptions-item>
      <el-descriptions-item label="活动状态">
        <el-tag :type="getStatusType(groupBuying?.status)">
          {{ getStatusText(groupBuying?.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="成团人数">
        {{ groupBuying?.groupSize }}人
      </el-descriptions-item>
      <el-descriptions-item label="团购价格">
        <span class="group-price">¥{{ groupBuying?.groupPrice }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="原价">
        <span class="original-price">¥{{ groupBuying?.originalPrice }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="活动时间" :span="3">
        {{ groupBuying?.startTime }} 至 {{ groupBuying?.endTime }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ groupBuying?.createTime }}
      </el-descriptions-item>
      <el-descriptions-item label="创建人">
        {{ groupBuying?.creator }}
      </el-descriptions-item>
      <el-descriptions-item label="是否推荐" :span="3">
        <el-tag v-if="groupBuying?.recommended" type="success">已推荐</el-tag>
        <el-tag v-else type="info">未推荐</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="活动描述" :span="3">
        {{ groupBuying?.description || '暂无描述' }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 数据统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6f7ff;">
              <el-icon size="24" color="#1890ff"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">当前成团数</div>
              <div class="stat-value">{{ groupBuying?.currentGroupCount }}</div>
              <div class="stat-desc">/ {{ groupBuying?.maxGroupCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f6ffed;">
              <el-icon size="24" color="#52c41a"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总订单数</div>
              <div class="stat-value">{{ groupBuying?.totalOrders }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fff7e6;">
              <el-icon size="24" color="#fa8c16"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总节省金额</div>
              <div class="stat-value">¥{{ groupBuying?.totalSavings }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f0f2f5;">
              <el-icon size="24" color="#8c8c8c"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">成团率</div>
              <div class="stat-value">{{ getGroupRate() }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 成团规则 -->
    <el-card class="rules-card">
      <template #header>
        <span class="card-title">成团规则</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="成团人数" :value="groupBuying?.groupSize" suffix="人" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="单人限购" :value="groupBuying?.rules?.maxParticipants || '不限'" suffix="件" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="拼团时限" :value="groupBuying?.rules?.groupValidHours" suffix="小时" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="最大开团数" :value="groupBuying?.maxGroupCount" suffix="个" />
        </el-col>
      </el-row>
    </el-card>

    <!-- 团购进度 -->
    <el-card class="progress-card">
      <template #header>
        <span class="card-title">团购进度</span>
      </template>
      <div class="progress-content">
        <div class="progress-item">
          <span class="progress-label">当前成团进度</span>
          <div class="progress-bar">
            <el-progress
              :percentage="getGroupProgress()"
              :color="getProgressColor(getGroupProgress())"
              :stroke-width="8"
            />
          </div>
          <span class="progress-text">{{ groupBuying?.currentGroupCount }} / {{ groupBuying?.maxGroupCount }}</span>
        </div>
        <div class="progress-item">
          <span class="progress-label">当前团购进度</span>
          <div class="progress-bar">
            <el-progress
              :percentage="getParticipantProgress()"
              :color="getProgressColor(getParticipantProgress())"
              :stroke-width="8"
            />
          </div>
          <span class="progress-text">{{ groupBuying?.currentGroupSize }} / {{ groupBuying?.groupSize }}人</span>
        </div>
      </div>
    </el-card>

    <!-- 历史团购记录（模拟数据） -->
    <el-card class="history-card">
      <template #header>
        <span class="card-title">历史团购记录</span>
      </template>
      <el-table :data="mockGroupHistory" style="width: 100%">
        <el-table-column label="团购ID" width="150">
          <template #default="{ row }">
            <span class="group-id">T{{ row.id.toString().padStart(6, '0') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="开团时间" width="180">
          <template #default="{ row }">
            {{ row.startTime }}
          </template>
        </el-table-column>
        <el-table-column label="成团时间" width="180">
          <template #default="{ row }">
            <span v-if="row.completedTime">{{ row.completedTime }}</span>
            <span v-else class="text-gray">未成团</span>
          </template>
        </el-table-column>
        <el-table-column label="参团人数" width="120">
          <template #default="{ row }">
            <el-tag type="info">{{ row.participants }}/{{ row.required }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
              {{ row.status === 'completed' ? '已成团' : '拼团中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="订单总额" width="120">
          <template #default="{ row }">
            ¥{{ row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column label="优惠金额" width="120">
          <template #default="{ row }">
            <span class="discount-amount">-¥{{ row.discountAmount }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  User, ShoppingCart, Money, TrendCharts
} from '@element-plus/icons-vue'

// Props
interface Props {
  groupBuying: any
}
const props = defineProps<Props>()

// 模拟历史团购记录
const mockGroupHistory = ref([
  {
    id: 1,
    startTime: '2024-01-10 10:30:00',
    completedTime: '2024-01-10 14:20:00',
    participants: 20,
    required: 20,
    status: 'completed',
    totalAmount: 19980,
    discountAmount: 2000
  },
  {
    id: 2,
    startTime: '2024-01-11 09:15:00',
    completedTime: '',
    participants: 15,
    required: 20,
    status: 'pending',
    totalAmount: 14985,
    discountAmount: 1500
  },
  {
    id: 3,
    startTime: '2024-01-11 14:45:00',
    completedTime: '2024-01-11 18:30:00',
    participants: 20,
    required: 20,
    status: 'completed',
    totalAmount: 19980,
    discountAmount: 2000
  },
  {
    id: 4,
    startTime: '2024-01-12 11:00:00',
    completedTime: '',
    participants: 8,
    required: 20,
    status: 'pending',
    totalAmount: 7992,
    discountAmount: 800
  }
])

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    draft: 'warning',
    waiting: 'info',
    active: 'success',
    inactive: 'info',
    ended: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    waiting: '待开始',
    active: '进行中',
    inactive: '已停用',
    ended: '已结束'
  }
  return textMap[status] || status
}

// 获取成团率
const getGroupRate = () => {
  if (!props.groupBuying?.maxGroupCount || props.groupBuying?.maxGroupCount === 0) return 0
  return Math.round((props.groupBuying.currentGroupCount / props.groupBuying.maxGroupCount) * 100)
}

// 获取团购进度百分比
const getGroupProgress = () => {
  if (!props.groupBuying?.maxGroupCount || props.groupBuying?.maxGroupCount === 0) return 0
  return Math.round((props.groupBuying.currentGroupCount / props.groupBuying.maxGroupCount) * 100)
}

// 获取参团进度百分比
const getParticipantProgress = () => {
  if (!props.groupBuying?.groupSize || props.groupBuying?.groupSize === 0) return 0
  return Math.round((props.groupBuying.currentGroupSize / props.groupBuying.groupSize) * 100)
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return '#67c23a'
  if (percentage >= 80) return '#e6a23c'
  if (percentage >= 60) return '#409eff'
  return '#f56c6c'
}

// 导出组件
defineOptions({
  name: 'GroupBuyingDetail'
})
</script>

<style scoped>
.group-buying-detail {
  padding: 0;
}

.stats-row {
  margin: 20px 0;
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

.stat-desc {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 2px;
}

.group-price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.original-price {
  color: #909399;
  text-decoration: line-through;
}

.rules-card,
.progress-card,
.history-card {
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-descriptions) {
  margin-bottom: 20px;
}

:deep(.el-descriptions__title) {
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
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

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 20px;
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.progress-label {
  width: 100px;
  font-size: 14px;
  color: #606266;
}

.progress-bar {
  flex: 1;
}

.progress-text {
  width: 120px;
  text-align: right;
  font-size: 14px;
  color: #606266;
}

.discount-amount {
  color: #f56c6c;
  font-weight: 600;
}

.text-gray {
  color: #909399;
}

.group-id {
  font-family: monospace;
  color: #606266;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
}
</style>
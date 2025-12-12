<template>
  <div class="seckill-detail">
    <!-- 活动基本信息 -->
    <el-descriptions title="活动信息" :column="3" border>
      <el-descriptions-item label="活动名称">
        {{ seckillActivity?.name }}
      </el-descriptions-item>
      <el-descriptions-item label="活动日期">
        {{ seckillActivity?.date }}
      </el-descriptions-item>
      <el-descriptions-item label="活动状态">
        <el-tag :type="getStatusType(seckillActivity?.status)">
          {{ getStatusText(seckillActivity?.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ seckillActivity?.createTime }}
      </el-descriptions-item>
      <el-descriptions-item label="创建人">
        {{ seckillActivity?.creator }}
      </el-descriptions-item>
      <el-descriptions-item label="是否推荐">
        <el-tag v-if="seckillActivity?.recommended" type="success">已推荐</el-tag>
        <el-tag v-else type="info">未推荐</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="活动描述" :span="3">
        {{ seckillActivity?.description || '暂无描述' }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 数据统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6f7ff;">
              <el-icon size="24" color="#1890ff"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">活动场次</div>
              <div class="stat-value">{{ seckillActivity?.sessions?.length || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f6ffed;">
              <el-icon size="24" color="#52c41a"><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">商品总数</div>
              <div class="stat-value">{{ getTotalProducts() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fff7e6;">
              <el-icon size="24" color="#fa8c16"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总售出</div>
              <div class="stat-value">{{ getTotalSold() }}</div>
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
              <div class="stat-title">总销售额</div>
              <div class="stat-value">¥{{ getTotalSales() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 场次详情 -->
    <el-card class="sessions-card">
      <template #header>
        <span class="card-title">场次详情</span>
      </template>

      <el-collapse v-model="activeSessions">
        <el-collapse-item
          v-for="(session, index) in seckillActivity?.sessions"
          :key="session.id"
          :title="getSessionTitle(session)"
          :name="index"
        >
          <div class="session-content">
            <!-- 场次信息 -->
            <el-row :gutter="20" class="session-info">
              <el-col :span="8">
                <div class="info-item">
                  <span class="label">场次名称：</span>
                  <span class="value">{{ session.name }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="info-item">
                  <span class="label">活动时间：</span>
                  <span class="value">{{ session.startTime }} - {{ session.endTime }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="info-item">
                  <span class="label">场次状态：</span>
                  <el-tag :type="getSessionStatusType(session.status)">
                    {{ getSessionStatusText(session.status) }}
                  </el-tag>
                </div>
              </el-col>
            </el-row>

            <!-- 场次商品列表 -->
            <div class="session-products">
              <h4 class="products-title">商品列表</h4>
              <el-table :data="session.products" style="width: 100%">
                <el-table-column label="商品信息" min-width="300">
                  <template #default="{ row }">
                    <div class="product-info">
                      <el-image
                        v-if="row.imageUrl"
                        :src="row.imageUrl"
                        :preview-src-list="[row.imageUrl]"
                        class="product-image"
                        fit="cover"
                      />
                      <div class="product-details">
                        <div class="product-name">{{ row.productName }}</div>
                        <div class="product-id">商品编号：{{ row.productId }}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="原价" width="120">
                  <template #default="{ row }">
                    <span class="original-price">¥{{ row.originalPrice }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="秒杀价" width="120">
                  <template #default="{ row }">
                    <span class="seckill-price">¥{{ row.seckillPrice }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="折扣" width="100">
                  <template #default="{ row }">
                    <span class="discount">{{ getDiscount(row) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="库存/已售" width="150">
                  <template #default="{ row }">
                    <el-progress
                      :percentage="getSoldPercentage(row)"
                      :color="getProgressColor(getSoldPercentage(row))"
                      :stroke-width="6"
                    />
                    <div class="stock-text">
                      {{ row.sold }} / {{ row.stock }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="销售额" width="120">
                  <template #default="{ row }">
                    <span class="sales-amount">¥{{ (row.seckillPrice * row.sold).toFixed(2) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 活动规则 -->
    <el-card class="rules-card" v-if="seckillActivity?.rules?.length">
      <template #header>
        <span class="card-title">活动规则</span>
      </template>
      <div class="rules-list">
        <el-tag
          v-for="rule in seckillActivity.rules"
          :key="rule"
          type="info"
          class="rule-tag"
        >
          {{ getRuleText(rule) }}
        </el-tag>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Clock, Goods, ShoppingCart, Money
} from '@element-plus/icons-vue'

// Props
interface Props {
  seckillActivity: any
}
const props = defineProps<Props>()

// 展开的场次
const activeSessions = ref([0])

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    draft: 'info',
    active: 'success',
    inactive: 'warning',
    ended: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    active: '进行中',
    inactive: '已停用',
    ended: '已结束'
  }
  return textMap[status] || status
}

// 获取场次状态类型
const getSessionStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    waiting: 'info',
    active: 'success',
    ended: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取场次状态文本
const getSessionStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    waiting: '等待开始',
    active: '进行中',
    ended: '已结束'
  }
  return textMap[status] || status
}

// 获取场次标题
const getSessionTitle = (session: any) => {
  return `${session.name} (${session.startTime} - ${session.endTime})`
}

// 获取商品总数
const getTotalProducts = () => {
  if (!props.seckillActivity?.sessions) return 0
  return props.seckillActivity.sessions.reduce(
    (total: number, session: any) => total + session.products.length,
    0
  )
}

// 获取总售出数
const getTotalSold = () => {
  if (!props.seckillActivity?.sessions) return 0
  return props.seckillActivity.sessions.reduce(
    (total: number, session: any) =>
      total + session.products.reduce((sum: number, product: any) => sum + product.sold, 0),
    0
  )
}

// 获取总销售额
const getTotalSales = () => {
  if (!props.seckillActivity?.sessions) return 0
  const total = props.seckillActivity.sessions.reduce(
    (total: number, session: any) =>
      total + session.products.reduce((sum: number, product: any) =>
        sum + (product.seckillPrice * product.sold), 0
      ),
    0
  )
  return total.toFixed(2)
}

// 获取折扣
const getDiscount = (product: any) => {
  if (!product.originalPrice || product.originalPrice === 0) return '-'
  const discount = (product.seckillPrice / product.originalPrice * 10).toFixed(1)
  return `${discount}折`
}

// 获取售出百分比
const getSoldPercentage = (product: any) => {
  if (!product.stock || product.stock === 0) return 0
  return Math.round((product.sold / product.stock) * 100)
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#409eff'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

// 获取规则文本
const getRuleText = (rule: string) => {
  const ruleMap: Record<string, string> = {
    limit_per_user: '每人每场次限购一件',
    no_discount: '不可使用优惠券',
    no_points: '不可使用积分'
  }
  return ruleMap[rule] || rule
}
</script>

<style scoped>
.seckill-detail {
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

.sessions-card {
  margin-bottom: 20px;
}

.rules-card {
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.session-content {
  padding: 10px 0;
}

.session-info {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
}

.value {
  color: #303133;
}

.session-products {
  margin-top: 20px;
}

.products-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.product-id {
  font-size: 12px;
  color: #909399;
}

.original-price {
  color: #909399;
  text-decoration: line-through;
}

.seckill-price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.discount {
  color: #e6a23c;
  font-weight: 600;
}

.stock-text {
  font-size: 12px;
  color: #909399;
  text-align: center;
  margin-top: 4px;
}

.sales-amount {
  color: #52c41a;
  font-weight: 600;
}

.rules-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.rule-tag {
  margin: 0;
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

/* 折叠面板样式 */
:deep(.el-collapse-item__header) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-collapse-item__content) {
  padding: 20px;
}

/* 表格样式 */
:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
}
</style>
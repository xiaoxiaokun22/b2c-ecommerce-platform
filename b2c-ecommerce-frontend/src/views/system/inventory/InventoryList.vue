<template>
  <div class="inventory-list">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2>库存管理</h2>
      <div class="actions">
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6f7ff;">
              <el-icon size="24" color="#1890ff"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总库存商品</div>
              <div class="stat-value">{{ overview.totalSKUs }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fff7e6;">
              <el-icon size="24" color="#fa8c16"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">库存预警</div>
              <div class="stat-value">{{ overview.lowStockCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fff1f0;">
              <el-icon size="24" color="#f5222d"><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">已售罄</div>
              <div class="stat-value">{{ overview.outOfStockCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f6ffed;">
              <el-icon size="24" color="#52c41a"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">库存周转率</div>
              <div class="stat-value">{{ overview.avgTurnover }}x</div>
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
        <el-form-item label="商品分类">
          <el-select
            v-model="searchForm.category"
            placeholder="请选择分类"
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
        <el-form-item label="库存状态">
          <el-select
            v-model="searchForm.stockStatus"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="正常" value="normal" />
            <el-option label="偏低" value="low" />
            <el-option label="警告" value="warning" />
            <el-option label="售罄" value="out_of_stock" />
          </el-select>
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

    <!-- 库存列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="productCode" label="商品编码" width="120" />
        <el-table-column prop="productName" label="商品名称" min-width="200">
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-name">{{ row.productName }}</div>
              <div class="product-spec">
                {{ formatSpecifications(row.specifications) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="warehouse" label="仓库" width="100" />
        <el-table-column label="当前库存" width="100" align="right">
          <template #default="{ row }">
            <span :class="getStockClass(row)">{{ row.currentStock }}</span>
          </template>
        </el-table-column>
        <el-table-column label="可用库存" width="100" align="right">
          <template #default="{ row }">
            {{ row.availableStock }}
          </template>
        </el-table-column>
        <el-table-column label="锁定库存" width="100" align="right">
          <template #default="{ row }">
            {{ row.lockedStock }}
          </template>
        </el-table-column>
        <el-table-column label="安全库存" width="100" align="right">
          <template #default="{ row }">
            {{ row.safetyStock }}
          </template>
        </el-table-column>
        <el-table-column label="日均销量" width="100" align="right">
          <template #default="{ row }">
            {{ row.avgDailySales }}
          </template>
        </el-table-column>
        <el-table-column label="预计可售天数" width="120" align="right">
          <template #default="{ row }">
            <span :class="getDaysOfSupplyClass(row)">
              {{ calculateDaysOfSupply(row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="库存状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.stockStatus)">
              {{ getStatusText(row.stockStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button type="warning" size="small" @click="handleAdjust(row)">
              调整
            </el-button>
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small" type="info">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="transfer">调拨</el-dropdown-item>
                  <el-dropdown-item command="record">变动记录</el-dropdown-item>
                  <el-dropdown-item command="warning">设置预警</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, Download, Search, RefreshLeft, Box, Warning,
  CircleClose, TrendCharts, ArrowDown
} from '@element-plus/icons-vue'
import { mockInventoryList } from '@/mock/inventory'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const tableData = ref<any[]>([])
const selectedRows = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  productName: '',
  productCode: '',
  category: '',
  warehouse: '',
  stockStatus: ''
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 概览数据
const overview = computed(() => ({
  totalSKUs: mockInventoryList.length,
  lowStockCount: mockInventoryList.filter(item =>
    item.stockStatus === 'low' || item.stockStatus === 'warning'
  ).length,
  outOfStockCount: mockInventoryList.filter(item =>
    item.stockStatus === 'out_of_stock'
  ).length,
  avgTurnover: '4.5'
}))

// 分类和仓库选项
const categories = ['手机数码', '电脑办公', '家用电器', '影音娱乐', '其他']
const warehouses = ['华东仓', '华南仓', '华北仓', '西南仓', '海外仓']

// 格式化规格信息
const formatSpecifications = (specs: any) => {
  if (!specs) return ''
  return Object.values(specs).join(' / ')
}

// 获取库存数量样式类
const getStockClass = (row: any) => {
  if (row.currentStock === 0) return 'stock-out'
  if (row.currentStock <= row.safetyStock) return 'stock-warning'
  return 'stock-normal'
}

// 获取预计可售天数样式类
const getDaysOfSupplyClass = (row: any) => {
  const days = calculateDaysOfSupply(row)
  if (days === 0) return 'days-critical'
  if (days <= 7) return 'days-warning'
  return 'days-normal'
}

// 计算预计可售天数
const calculateDaysOfSupply = (row: any) => {
  if (row.avgDailySales <= 0) return '∞'
  if (row.availableStock <= 0) return 0
  return Math.floor(row.availableStock / row.avgDailySales)
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

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 筛选数据
    let filteredData = [...mockInventoryList]

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

    if (searchForm.category) {
      filteredData = filteredData.filter(item => item.category === searchForm.category)
    }

    if (searchForm.warehouse) {
      filteredData = filteredData.filter(item => item.warehouse === searchForm.warehouse)
    }

    if (searchForm.stockStatus) {
      filteredData = filteredData.filter(item => item.stockStatus === searchForm.stockStatus)
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

// 查看详情
const handleViewDetail = (row: any) => {
  router.push(`/system/inventory/detail/${row.id}`)
}

// 库存调整
const handleAdjust = (row: any) => {
  router.push(`/system/inventory/adjust?id=${row.id}`)
}

// 处理下拉菜单命令
const handleCommand = (command: string, row: any) => {
  switch (command) {
    case 'transfer':
      ElMessage.info('调拨功能开发中...')
      break
    case 'record':
      router.push(`/system/inventory/detail/${row.id}?tab=records`)
      break
    case 'warning':
      ElMessage.info('预警设置功能开发中...')
      break
  }
}

// 多选
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
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
.inventory-list {
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

.search-card {
  margin-bottom: 20px;
}

.product-info {
  line-height: 1.4;
}

.product-name {
  font-weight: 500;
  color: #303133;
}

.product-spec {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
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
</style>
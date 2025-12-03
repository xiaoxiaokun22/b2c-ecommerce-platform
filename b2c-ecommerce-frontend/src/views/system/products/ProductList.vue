<template>
  <div class="product-list">
    <div class="page-header">
      <div class="header-content">
        <h2>商品管理</h2>
        <p>管理所有商品信息，支持多SKU、规格组合、库存管理</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加商品
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出商品
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-container">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入商品名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-cascader
            v-model="searchForm.categoryId"
            :options="categoryOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            placeholder="请选择分类"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="上架" value="active" />
            <el-option label="下架" value="inactive" />
            <el-option label="草稿" value="draft" />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌">
          <el-input
            v-model="searchForm.brand"
            placeholder="请输入品牌"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 批量操作 -->
    <div class="batch-actions" v-if="selectedRows.length > 0">
      <el-alert
        :title="`已选择 ${selectedRows.length} 个商品`"
        type="info"
        show-icon
        :closable="false"
      >
        <template #default>
          <el-button type="success" size="small" @click="handleBatchStatus('active')">
            批量上架
          </el-button>
          <el-button type="warning" size="small" @click="handleBatchStatus('inactive')">
            批量下架
          </el-button>
          <el-button type="danger" size="small" @click="handleBatchDelete">
            批量删除
          </el-button>
        </template>
      </el-alert>
    </div>

    <!-- 商品表格 -->
    <div class="table-container">
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="image" label="商品图片" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.mainImage"
              :preview-src-list="[row.mainImage]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="商品分类" width="150" />
        <el-table-column prop="brand" label="品牌" width="120" />
        <el-table-column prop="skuCount" label="SKU数量" width="100" align="center" />
        <el-table-column prop="minPrice" label="价格区间" width="120">
          <template #default="{ row }">
            <span v-if="row.minPrice === row.maxPrice">
              ¥{{ row.minPrice }}
            </span>
            <span v-else>
              ¥{{ row.minPrice }} - ¥{{ row.maxPrice }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="totalStock" label="总库存" width="100" align="center">
          <template #default="{ row }">
            <el-badge :value="row.totalStock" :type="row.totalStock > 0 ? 'primary' : 'danger'" />
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'active' ? 'success' : row.status === 'inactive' ? 'info' : 'warning'"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <div class="table-action-buttons" data-buttons="4">
              <el-button type="primary" link @click="handleView(row)">
                <el-icon><View /></el-icon>
                <span>查看</span>
              </el-button>
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                <span>编辑</span>
              </el-button>
              <el-button
                :type="row.status === 'active' ? 'warning' : 'success'"
                link
                @click="handleToggleStatus(row)"
              >
                <el-icon><Switch /></el-icon>
                <span>{{ row.status === 'active' ? '下架' : '上架' }}</span>
              </el-button>
              <el-popconfirm
                :title="`确定要删除商品「${row.name}」吗？此操作不可恢复。`"
                width="220"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button type="danger" link>
                    <el-icon><Delete /></el-icon>
                    <span>删除</span>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Download,
  Search,
  Refresh,
  Picture,
  View,
  Edit,
  Switch,
  Delete
} from '@element-plus/icons-vue'

// 类型定义
interface Product {
  id: number
  name: string
  categoryId: number
  categoryName: string
  brand: string
  mainImage: string
  skuCount: number
  minPrice: number
  maxPrice: number
  totalStock: number
  sales: number
  status: 'active' | 'inactive' | 'draft'
  createdAt: string
}

interface Category {
  id: number
  name: string
  children?: Category[]
}

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const tableData = ref<Product[]>([])
const selectedRows = ref<Product[]>([])
const categoryOptions = ref<Category[]>([])

// 搜索表单
const searchForm = reactive({
  name: '',
  categoryId: null as number | null,
  status: '',
  brand: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 方法
const loadProducts = async () => {
  loading.value = true
  try {
    // 这里应该调用实际的API
    // const response = await productApi.getProducts({
    //   ...searchForm,
    //   page: pagination.page,
    //   size: pagination.size
    // })

    // 模拟数据
    const mockData: Product[] = [
      {
        id: 1,
        name: 'iPhone 15 Pro Max',
        categoryId: 111,
        categoryName: '电子产品 > 手机 > iPhone',
        brand: 'Apple',
        mainImage: 'https://via.placeholder.com/60x60',
        skuCount: 3,
        minPrice: 9999,
        maxPrice: 12999,
        totalStock: 150,
        sales: 1234,
        status: 'active',
        createdAt: '2024-01-01 10:00:00'
      },
      {
        id: 2,
        name: 'Samsung Galaxy S24 Ultra',
        categoryId: 112,
        categoryName: '电子产品 > 手机 > Android手机',
        brand: 'Samsung',
        mainImage: 'https://via.placeholder.com/60x60',
        skuCount: 2,
        minPrice: 8999,
        maxPrice: 10999,
        totalStock: 80,
        sales: 567,
        status: 'active',
        createdAt: '2024-01-02 11:00:00'
      },
      {
        id: 3,
        name: 'MacBook Pro 16"',
        categoryId: 12,
        categoryName: '电子产品 > 电脑',
        brand: 'Apple',
        mainImage: 'https://via.placeholder.com/60x60',
        skuCount: 4,
        minPrice: 19999,
        maxPrice: 29999,
        totalStock: 45,
        sales: 234,
        status: 'active',
        createdAt: '2024-01-03 12:00:00'
      },
      {
        id: 4,
        name: '男士T恤',
        categoryId: 21,
        categoryName: '服装 > 男装',
        brand: 'Uniqlo',
        mainImage: 'https://via.placeholder.com/60x60',
        skuCount: 5,
        minPrice: 99,
        maxPrice: 199,
        totalStock: 500,
        sales: 3456,
        status: 'inactive',
        createdAt: '2024-01-04 13:00:00'
      },
      {
        id: 5,
        name: '女士连衣裙',
        categoryId: 22,
        categoryName: '服装 > 女装',
        brand: 'Zara',
        mainImage: 'https://via.placeholder.com/60x60',
        skuCount: 8,
        minPrice: 299,
        maxPrice: 799,
        totalStock: 200,
        sales: 789,
        status: 'draft',
        createdAt: '2024-01-05 14:00:00'
      }
    ]

    tableData.value = mockData
    pagination.total = 100
  } catch (error) {
    ElMessage.error('加载商品数据失败')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    // 模拟数据
    const mockCategories: Category[] = [
      {
        id: 1,
        name: '电子产品',
        children: [
          {
            id: 11,
            name: '手机',
            children: [
              { id: 111, name: 'iPhone' },
              { id: 112, name: 'Android手机' }
            ]
          },
          { id: 12, name: '电脑' }
        ]
      },
      {
        id: 2,
        name: '服装',
        children: [
          { id: 21, name: '男装' },
          { id: 22, name: '女装' }
        ]
      }
    ]
    categoryOptions.value = mockCategories
  } catch (error) {
    ElMessage.error('加载分类数据失败')
  }
}

const getStatusText = (status: string) => {
  const statusMap = {
    active: '上架',
    inactive: '下架',
    draft: '草稿'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const handleSearch = () => {
  pagination.page = 1
  loadProducts()
}

const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    categoryId: null,
    status: '',
    brand: ''
  })
  handleSearch()
}

const handleAdd = () => {
  router.push('/system/products/add')
}

const handleEdit = (row: Product) => {
  router.push(`/system/products/edit/${row.id}`)
}

const handleView = (row: Product) => {
  ElMessage.info(`查看商品详情：${row.name}`)
}

const handleToggleStatus = async (row: Product) => {
  try {
    const newStatus = row.status === 'active' ? 'inactive' : 'active'
    const actionText = newStatus === 'active' ? '上架' : '下架'

    await ElMessageBox.confirm(
      `确定要${actionText}商品"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 这里应该调用实际的API
    // await productApi.updateProductStatus(row.id, newStatus)

    ElMessage.success(`${actionText}成功`)
    loadProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleDelete = async (row: Product) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品"${row.name}"吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 这里应该调用实际的API
    // await productApi.deleteProduct(row.id)

    ElMessage.success('删除成功')
    loadProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSelectionChange = (selection: Product[]) => {
  selectedRows.value = selection
}

const handleBatchStatus = async (status: 'active' | 'inactive') => {
  try {
    const actionText = status === 'active' ? '上架' : '下架'

    await ElMessageBox.confirm(
      `确定要批量${actionText}选中的 ${selectedRows.value.length} 个商品吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 这里应该调用实际的API
    // await productApi.batchUpdateStatus(selectedRows.value.map(p => p.id), status)

    ElMessage.success(`批量${actionText}成功`)
    selectedRows.value = []
    loadProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedRows.value.length} 个商品吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 这里应该调用实际的API
    // await productApi.batchDelete(selectedRows.value.map(p => p.id))

    ElMessage.success('批量删除成功')
    selectedRows.value = []
    loadProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadProducts()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadProducts()
}

// 生命周期
onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>

<style scoped>
@import '@/styles/table-actions.css';

.product-list {
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.header-content h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.header-content p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-container {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

.batch-actions {
  margin-bottom: 20px;
}

.table-container {
  background: white;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.image-error {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  border-radius: 4px;
}

:deep(.el-alert) {
  margin-bottom: 20px;
}

:deep(.el-alert__content) {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
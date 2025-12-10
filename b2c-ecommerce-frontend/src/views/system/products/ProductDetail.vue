<template>
  <div class="product-detail">
    <el-card v-loading="loading">
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回商品列表
        </el-button>
      </div>

      <!-- 商品基本信息 -->
      <div class="product-info">
        <h2 class="section-title">商品基本信息</h2>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品ID">{{ productInfo.id }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ productInfo.name }}</el-descriptions-item>
          <el-descriptions-item label="商品分类">{{ productInfo.categoryName }}</el-descriptions-item>
          <el-descriptions-item label="品牌">{{ productInfo.brand }}</el-descriptions-item>
          <el-descriptions-item label="SKU数量">{{ productInfo.skuCount }}</el-descriptions-item>
          <el-descriptions-item label="总库存">{{ productInfo.totalStock }}</el-descriptions-item>
          <el-descriptions-item label="价格区间">
            <span v-if="productInfo.minPrice === productInfo.maxPrice">
              ¥{{ productInfo.minPrice }}
            </span>
            <span v-else>
              ¥{{ productInfo.minPrice }} - ¥{{ productInfo.maxPrice }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="销量">{{ productInfo.sales }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag
              :type="productInfo.status === 'active' ? 'success' : productInfo.status === 'inactive' ? 'info' : 'warning'"
            >
              {{ getStatusText(productInfo.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ productInfo.createdAt }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 商品图片 -->
      <div class="product-images">
        <h2 class="section-title">商品图片</h2>
        <div class="image-gallery">
          <el-image
            v-for="(image, index) in productInfo.images"
            :key="index"
            :src="image"
            :preview-src-list="productInfo.images"
            fit="cover"
            style="width: 200px; height: 200px; margin: 10px;"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </div>

      <!-- 商品描述 -->
      <div class="product-description">
        <h2 class="section-title">商品描述</h2>
        <div class="description-content" v-html="productInfo.description || '暂无描述'"></div>
      </div>

      <!-- SKU列表 -->
      <div class="product-skus">
        <h2 class="section-title">SKU规格</h2>
        <el-table :data="productInfo.skus" border stripe>
          <el-table-column prop="sku" label="SKU编码" width="150" />
          <el-table-column prop="spec" label="规格" min-width="200" />
          <el-table-column prop="price" label="价格" width="120">
            <template #default="{ row }">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="100" align="center" />
          <el-table-column prop="sales" label="销量" width="100" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.stock > 0 ? 'success' : 'danger'">
                {{ row.stock > 0 ? '有货' : '缺货' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Picture } from '@element-plus/icons-vue'

// 类型定义
interface ProductInfo {
  id: number
  name: string
  categoryId: number
  categoryName: string
  brand: string
  mainImage: string
  images: string[]
  skuCount: number
  minPrice: number
  maxPrice: number
  totalStock: number
  sales: number
  status: 'active' | 'inactive' | 'draft'
  description: string
  createdAt: string
  skus: SkuInfo[]
}

interface SkuInfo {
  sku: string
  spec: string
  price: number
  stock: number
  sales: number
  status: boolean
}

// 路由
const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const productInfo = ref<ProductInfo>({
  id: 0,
  name: '',
  categoryId: 0,
  categoryName: '',
  brand: '',
  mainImage: '',
  images: [],
  skuCount: 0,
  minPrice: 0,
  maxPrice: 0,
  totalStock: 0,
  sales: 0,
  status: 'active',
  description: '',
  createdAt: '',
  skus: []
})

// 方法
const loadProductDetail = async () => {
  const productId = route.params.id
  if (!productId) {
    ElMessage.error('缺少商品ID')
    router.push('/system/products')
    return
  }

  loading.value = true
  try {
    // 这里应该调用实际的API
    // const response = await productApi.getProductDetail(productId)

    // 模拟数据
    const mockData: ProductInfo = {
      id: Number(productId),
      name: 'iPhone 15 Pro Max',
      categoryId: 111,
      categoryName: '电子产品 > 手机 > iPhone',
      brand: 'Apple',
      mainImage: 'https://via.placeholder.com/400x400',
      images: [
        'https://via.placeholder.com/400x400',
        'https://via.placeholder.com/400x400',
        'https://via.placeholder.com/400x400'
      ],
      skuCount: 3,
      minPrice: 9999,
      maxPrice: 12999,
      totalStock: 150,
      sales: 1234,
      status: 'active',
      description: '<p>全新 iPhone 15 Pro Max，搭载 A17 Pro 芯片，钛金属设计，支持 USB-C 接口。</p>',
      createdAt: '2024-01-01 10:00:00',
      skus: [
        {
          sku: 'IP15PM-256-NB',
          spec: '256GB 原色钛金属',
          price: 9999,
          stock: 50,
          sales: 412,
          status: true
        },
        {
          sku: 'IP15PM-256-BL',
          spec: '256GB 蓝色钛金属',
          price: 9999,
          stock: 45,
          sales: 389,
          status: true
        },
        {
          sku: 'IP15PM-512-WH',
          spec: '512GB 白色钛金属',
          price: 12999,
          stock: 30,
          sales: 234,
          status: true
        },
        {
          sku: 'IP15PM-1TB-BK',
          spec: '1TB 黑色钛金属',
          price: 14999,
          stock: 25,
          sales: 199,
          status: true
        }
      ]
    }

    productInfo.value = mockData
  } catch (error) {
    ElMessage.error('加载商品详情失败')
    console.error(error)
  } finally {
    loading.value = false
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

const handleBack = () => {
  router.push('/system/products')
}

// 生命周期
onMounted(() => {
  loadProductDetail()
})
</script>

<style scoped>
.product-detail {
  padding: 20px;
}

.back-button {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 30px 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #e4e7ed;
}

.product-info {
  margin-bottom: 30px;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-error {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  border-radius: 4px;
}

.description-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  line-height: 1.6;
  color: #606266;
}

.product-skus {
  margin-top: 30px;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
}
</style>
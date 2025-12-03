<template>
  <div class="product-form">
    <div class="page-header">
      <div class="header-content">
        <h2>{{ isEdit ? '编辑商品' : '添加商品' }}</h2>
        <p>{{ isEdit ? '修改商品信息，支持多SKU管理' : '创建新商品，配置规格和库存' }}</p>
      </div>
      <div class="header-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          {{ isEdit ? '保存修改' : '创建商品' }}
        </el-button>
      </div>
    </div>

    <div class="form-container">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        :disabled="saving"
      >
        <!-- 基本信息 -->
        <el-card class="form-section" header="基本信息">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入商品名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品分类" prop="categoryId">
                <el-cascader
                  v-model="form.categoryId"
                  :options="categoryOptions"
                  :props="{ value: 'id', label: 'name', children: 'children' }"
                  placeholder="请选择商品分类"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="品牌" prop="brand">
                <el-input v-model="form.brand" placeholder="请输入品牌" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品状态" prop="status">
                <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                  <el-option label="上架" value="active" />
                  <el-option label="下架" value="inactive" />
                  <el-option label="草稿" value="draft" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="商品描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="请输入商品描述"
            />
          </el-form-item>
        </el-card>

        <!-- 商品图片 -->
        <el-card class="form-section" header="商品图片">
          <el-form-item label="商品主图" prop="mainImage">
            <image-uploader
              v-model="form.mainImage"
              :limit="1"
              :max-size="5"
              accept="image/*"
            />
          </el-form-item>
          <el-form-item label="商品相册" prop="images">
            <image-uploader
              v-model="form.images"
              :limit="10"
              :max-size="5"
              accept="image/*"
              multiple
            />
          </el-form-item>
        </el-card>

        <!-- 商品规格 -->
        <el-card class="form-section" header="商品规格">
          <div class="spec-section">
            <div class="spec-header">
              <span>规格配置</span>
              <el-button type="primary" size="small" @click="handleAddSpec">
                <el-icon><Plus /></el-icon>
                添加规格
              </el-button>
            </div>

            <div v-if="form.specs.length === 0" class="empty-specs">
              <el-empty description="暂无规格，请添加商品规格" />
            </div>

            <div v-else class="specs-list">
              <div v-for="(spec, index) in form.specs" :key="spec.id" class="spec-item">
                <div class="spec-header-row">
                  <el-input
                    v-model="spec.name"
                    placeholder="规格名称，如：颜色、尺寸"
                    style="width: 200px"
                  />
                  <el-button type="danger" size="small" @click="handleRemoveSpec(index)">
                    删除
                  </el-button>
                </div>
                <div class="spec-values">
                  <div class="spec-values-header">
                    <span>规格值：</span>
                    <el-button type="primary" size="small" @click="handleAddSpecValue(index)">
                      <el-icon><Plus /></el-icon>
                      添加值
                    </el-button>
                  </div>
                  <div class="spec-values-list">
                    <div
                      v-for="(value, vIndex) in spec.values"
                      :key="vIndex"
                      class="spec-value-item"
                    >
                      <el-input
                        v-model="spec.values[vIndex]"
                        placeholder="规格值"
                        size="small"
                        style="width: 120px"
                      />
                      <el-button
                        type="danger"
                        size="small"
                        @click="handleRemoveSpecValue(index, vIndex)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <el-button
              v-if="form.specs.length > 0"
              type="success"
              @click="generateSkus"
              style="margin-top: 20px"
            >
              生成SKU列表
            </el-button>
          </div>
        </el-card>

        <!-- SKU管理 -->
        <el-card v-if="form.skus.length > 0" class="form-section" header="SKU管理">
          <div class="sku-section">
            <el-table :data="form.skus" border>
              <el-table-column label="SKU规格" min-width="200">
                <template #default="{ row }">
                  <div class="sku-specs">
                    <el-tag
                      v-for="(value, index) in row.specValues"
                      :key="index"
                      size="small"
                      style="margin-right: 5px"
                    >
                      {{ value }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="SKU编码" width="150">
                <template #default="{ row, $index }">
                  <el-input
                    v-model="row.skuCode"
                    placeholder="SKU编码"
                    size="small"
                  />
                </template>
              </el-table-column>
              <el-table-column label="售价" width="120">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.price"
                    :min="0"
                    :precision="2"
                    size="small"
                    style="width: 100px"
                  />
                </template>
              </el-table-column>
              <el-table-column label="市场价" width="120">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.marketPrice"
                    :min="0"
                    :precision="2"
                    size="small"
                    style="width: 100px"
                  />
                </template>
              </el-table-column>
              <el-table-column label="库存" width="100">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.stock"
                    :min="0"
                    size="small"
                    style="width: 80px"
                  />
                </template>
              </el-table-column>
              <el-table-column label="启用" width="80">
                <template #default="{ row }">
                  <el-switch v-model="row.enabled" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

        <!-- 其他信息 -->
        <el-card class="form-section" header="其他信息">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="重量(kg)" prop="weight">
                <el-input-number
                  v-model="form.weight"
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="体积(m³)" prop="volume">
                <el-input-number
                  v-model="form.volume"
                  :min="0"
                  :precision="3"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="排序" prop="sort">
                <el-input-number
                  v-model="form.sort"
                  :min="0"
                  :max="999"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import ImageUploader from '@/components/ImageUploader.vue'

// 类型定义
interface Spec {
  id: string
  name: string
  values: string[]
}

interface Sku {
  id: string
  specValues: string[]
  skuCode: string
  price: number
  marketPrice: number
  stock: number
  enabled: boolean
}

interface ProductForm {
  id?: number
  name: string
  categoryId: number | null
  brand: string
  status: 'active' | 'inactive' | 'draft'
  description: string
  mainImage: string
  images: string[]
  specs: Spec[]
  skus: Sku[]
  weight: number
  volume: number
  sort: number
}

interface Category {
  id: number
  name: string
  children?: Category[]
}

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const formRef = ref<FormInstance>()
const saving = ref(false)
const categoryOptions = ref<Category[]>([])

// 是否为编辑模式
const isEdit = computed(() => Boolean(route.params.id))

// 表单数据
const form = reactive<ProductForm>({
  name: '',
  categoryId: null,
  brand: '',
  status: 'draft',
  description: '',
  mainImage: '',
  images: [],
  specs: [],
  skus: [],
  weight: 0,
  volume: 0,
  sort: 0
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '商品名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  brand: [
    { required: true, message: '请输入品牌', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择商品状态', trigger: 'change' }
  ],
  mainImage: [
    { required: true, message: '请上传商品主图', trigger: 'change' }
  ]
}

// 方法
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

const loadProduct = async (id: number) => {
  try {
    // 这里应该调用实际的API
    // const response = await productApi.getProduct(id)

    // 模拟数据
    const mockProduct = {
      id,
      name: 'iPhone 15 Pro Max',
      categoryId: [1, 11, 111],
      brand: 'Apple',
      status: 'active',
      description: '最新的iPhone手机',
      mainImage: 'https://via.placeholder.com/300x300',
      images: [
        'https://via.placeholder.com/300x300',
        'https://via.placeholder.com/300x300'
      ],
      specs: [
        {
          id: '1',
          name: '颜色',
          values: ['黑色', '银色', '金色']
        },
        {
          id: '2',
          name: '容量',
          values: ['256GB', '512GB', '1TB']
        }
      ],
      skus: [
        {
          id: '1',
          specValues: ['黑色', '256GB'],
          skuCode: 'IP15PM-BK-256',
          price: 9999,
          marketPrice: 10999,
          stock: 50,
          enabled: true
        },
        {
          id: '2',
          specValues: ['黑色', '512GB'],
          skuCode: 'IP15PM-BK-512',
          price: 11999,
          marketPrice: 12999,
          stock: 30,
          enabled: true
        }
      ],
      weight: 0.2,
      volume: 0.001,
      sort: 1
    }

    Object.assign(form, mockProduct)
  } catch (error) {
    ElMessage.error('加载商品数据失败')
  }
}

const handleAddSpec = () => {
  form.specs.push({
    id: Date.now().toString(),
    name: '',
    values: []
  })
}

const handleRemoveSpec = (index: number) => {
  form.specs.splice(index, 1)
  form.skus = []
}

const handleAddSpecValue = (specIndex: number) => {
  form.specs[specIndex].values.push('')
}

const handleRemoveSpecValue = (specIndex: number, valueIndex: number) => {
  form.specs[specIndex].values.splice(valueIndex, 1)
}

const generateSkus = () => {
  // 检查规格是否完整
  const hasEmptySpec = form.specs.some(spec => !spec.name || spec.values.length === 0)
  if (hasEmptySpec) {
    ElMessage.warning('请完善规格信息')
    return
  }

  // 生成SKU组合
  const generateCombinations = (specs: Spec[]): string[][] => {
    if (specs.length === 0) return []
    if (specs.length === 1) {
      return specs[0].values.map(value => [value])
    }

    const [firstSpec, ...restSpecs] = specs
    const restCombinations = generateCombinations(restSpecs)
    const result: string[][] = []

    firstSpec.values.forEach(value => {
      restCombinations.forEach(combination => {
        result.push([value, ...combination])
      })
    })

    return result
  }

  const combinations = generateCombinations(form.specs)

  form.skus = combinations.map((combination, index) => ({
    id: (index + 1).toString(),
    specValues: combination,
    skuCode: '',
    price: 0,
    marketPrice: 0,
    stock: 0,
    enabled: true
  }))

  ElMessage.success(`已生成 ${form.skus.length} 个SKU`)
}

const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 验证SKU
    if (form.specs.length > 0 && form.skus.length === 0) {
      ElMessage.warning('请生成SKU列表')
      return
    }

    if (form.skus.length > 0) {
      const hasInvalidSku = form.skus.some(sku =>
        !sku.skuCode || sku.price <= 0 || sku.stock < 0
      )
      if (hasInvalidSku) {
        ElMessage.warning('请完善SKU信息')
        return
      }
    }

    saving.value = true

    // 这里应该调用实际的API
    if (isEdit.value) {
      // await productApi.updateProduct(form.id!, form)
      ElMessage.success('商品更新成功')
    } else {
      // await productApi.createProduct(form)
      ElMessage.success('商品创建成功')
    }

    router.push('/system/products')
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败')
    }
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  router.push('/system/products')
}

// 生命周期
onMounted(() => {
  loadCategories()
  if (isEdit.value) {
    loadProduct(Number(route.params.id))
  }
})
</script>

<style scoped>
.product-form {
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

.form-container {
  max-width: 1200px;
}

.form-section {
  margin-bottom: 20px;
}

.spec-section {
  padding: 20px 0;
}

.spec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-weight: 600;
  color: #303133;
}

.empty-specs {
  padding: 40px 0;
  text-align: center;
}

.specs-list {
  space-y: 20px;
}

.spec-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background: #fafafa;
}

.spec-header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.spec-values-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.spec-values-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-value-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sku-section {
  padding: 20px 0;
}

.sku-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

:deep(.el-card__header) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
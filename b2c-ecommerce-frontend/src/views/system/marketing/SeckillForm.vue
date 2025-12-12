<template>
  <div class="seckill-form">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/system/seckill' }">秒杀活动</el-breadcrumb-item>
        <el-breadcrumb-item>{{ isEdit ? '编辑' : '创建' }}秒杀活动</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      class="seckill-form-content"
    >
      <!-- 基本信息 -->
      <el-card class="form-section">
        <template #header>
          <span class="section-title">基本信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入活动名称，如：今日秒杀场"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动日期" prop="date">
              <el-date-picker
                v-model="formData.date"
                type="date"
                placeholder="请选择活动日期"
                :disabled-date="disabledDate"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-card>

      <!-- 秒杀场次 -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <span class="section-title">秒杀场次</span>
            <el-button type="primary" size="small" @click="handleAddSession">
              <el-icon><Plus /></el-icon>
              添加场次
            </el-button>
          </div>
        </template>

        <div v-if="formData.sessions.length === 0" class="empty-state">
          <el-empty description="暂无场次，请添加" />
        </div>

        <div v-for="(session, index) in formData.sessions" :key="session.id" class="session-item">
          <el-card shadow="hover">
            <template #header>
              <div class="session-header">
                <span>场次 {{ index + 1 }}</span>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click="handleDeleteSession(index)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </template>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item
                  :label="`场次名称`"
                  :prop="`sessions.${index}.name`"
                  :rules="[{ required: true, message: '请输入场次名称', trigger: 'blur' }]"
                >
                  <el-input
                    v-model="session.name"
                    placeholder="如：10点场"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  label="开始时间"
                  :prop="`sessions.${index}.startTime`"
                  :rules="[{ required: true, message: '请选择开始时间', trigger: 'change' }]"
                >
                  <el-time-picker
                    v-model="session.startTime"
                    format="HH:mm"
                    value-format="HH:mm"
                    placeholder="选择时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  label="结束时间"
                  :prop="`sessions.${index}.endTime`"
                  :rules="[{ required: true, message: '请选择结束时间', trigger: 'change' }]"
                >
                  <el-time-picker
                    v-model="session.endTime"
                    format="HH:mm"
                    value-format="HH:mm"
                    placeholder="选择时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 场次商品 -->
            <div class="session-products">
              <div class="products-header">
                <span>场次商品</span>
                <el-button type="primary" size="small" @click="handleAddProduct(index)">
                  <el-icon><Plus /></el-icon>
                  添加商品
                </el-button>
              </div>
              <el-table :data="session.products" style="width: 100%">
                <el-table-column prop="productName" label="商品名称" min-width="200">
                  <template #default="{ row }">
                    <el-select
                      v-model="row.productId"
                      placeholder="选择商品"
                      filterable
                      @change="(val) => handleProductChange(val, row)"
                    >
                      <el-option
                        v-for="product in productOptions"
                        :key="product.id"
                        :label="product.name"
                        :value="product.id"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="原价" width="120">
                  <template #default="{ row }">
                    <span v-if="row.originalPrice">¥{{ row.originalPrice }}</span>
                    <span v-else class="text-gray">-</span>
                  </template>
                </el-table-column>
                <el-table-column label="秒杀价" width="150">
                  <template #default="{ row }">
                    <el-input-number
                      v-model="row.seckillPrice"
                      :min="0.01"
                      :max="row.originalPrice || 999999"
                      :precision="2"
                      placeholder="秒杀价"
                      size="small"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="库存数量" width="120">
                  <template #default="{ row }">
                    <el-input-number
                      v-model="row.stock"
                      :min="1"
                      :max="9999"
                      size="small"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="已售数量" width="120">
                  <template #default="{ row }">
                    {{ row.sold || 0 }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80" fixed="right">
                  <template #default="{ $index }">
                    <el-button
                      type="danger"
                      size="small"
                      text
                      @click="handleDeleteProduct(index, $index)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </div>
      </el-card>

      <!-- 活动设置 -->
      <el-card class="form-section">
        <template #header>
          <span class="section-title">活动设置</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio label="draft">草稿</el-radio>
                <el-radio label="active">激活</el-radio>
                <el-radio label="inactive">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否推荐">
              <el-switch v-model="formData.recommended" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="活动规则">
          <el-checkbox-group v-model="formData.rules">
            <el-checkbox label="limit_per_user">每人每场次限购一件</el-checkbox>
            <el-checkbox label="no_discount">不可使用优惠券</el-checkbox>
            <el-checkbox label="no_points">不可使用积分</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { mockSeckillActivities } from '@/mock/marketing'

const router = useRouter()
const route = useRoute()

// 是否编辑模式
const isEdit = computed(() => !!route.query.edit)

// 表单引用
const formRef = ref()

// 保存中状态
const saving = ref(false)

// 商品选项（模拟数据）
const productOptions = ref([
  { id: 'PRD001', name: 'Apple iPhone 14 Pro', price: 8999 },
  { id: 'PRD002', name: 'Sony WH-1000XM5 降噪耳机', price: 2499 },
  { id: 'PRD003', name: '戴森V15吸尘器', price: 4999 },
  { id: 'PRD004', name: '小米空气净化器 Pro', price: 1499 },
  { id: 'PRD005', name: '华为Mate 60 Pro', price: 6999 },
  { id: 'PRD006', name: 'MacBook Air M2', price: 9499 },
  { id: 'PRD007', name: 'iPad Pro 11英寸', price: 6799 },
  { id: 'PRD008', name: 'AirPods Pro 2', price: 1899 },
  { id: 'PRD009', name: '小米电视 65英寸', price: 3999 },
  { id: 'PRD010', name: '格力空调 1.5匹', price: 2999 }
])

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  date: '',
  description: '',
  status: 'draft',
  recommended: false,
  rules: [],
  sessions: []
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  date: [
    { required: true, message: '请选择活动日期', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择活动状态', trigger: 'change' }
  ]
}

// 禁用今天之前的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 生成唯一ID
const generateId = () => {
  return 'SECKILL' + Date.now().toString(36).toUpperCase()
}

// 添加场次
const handleAddSession = () => {
  formData.sessions.push({
    id: generateId(),
    name: '',
    startTime: '',
    endTime: '',
    status: 'waiting',
    products: []
  })
  ElMessage.success('场次添加成功')
}

// 删除场次
const handleDeleteSession = async (index: number) => {
  try {
    await ElMessageBox.confirm(
      '确认删除该场次吗？删除后不可恢复。',
      '提示',
      {
        type: 'warning'
      }
    )
    formData.sessions.splice(index, 1)
    ElMessage.success('场次删除成功')
  } catch {
    // 用户取消
  }
}

// 添加商品
const handleAddProduct = (sessionIndex: number) => {
  formData.sessions[sessionIndex].products.push({
    productId: '',
    productName: '',
    originalPrice: 0,
    seckillPrice: 0,
    stock: 100,
    sold: 0,
    imageUrl: ''
  })
}

// 删除商品
const handleDeleteProduct = (sessionIndex: number, productIndex: number) => {
  formData.sessions[sessionIndex].products.splice(productIndex, 1)
}

// 商品选择变化
const handleProductChange = (productId: string, product: any) => {
  const selectedProduct = productOptions.value.find(p => p.id === productId)
  if (selectedProduct) {
    product.productName = selectedProduct.name
    product.originalPrice = selectedProduct.price
    product.seckillPrice = selectedProduct.price * 0.7 // 默认7折
  }
}

// 保存
const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    saving.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (isEdit.value) {
      // 更新逻辑
      const index = mockSeckillActivities.findIndex(item => item.id === formData.id)
      if (index > -1) {
        mockSeckillActivities[index] = { ...formData }
      }
      ElMessage.success('更新成功')
    } else {
      // 创建逻辑
      formData.id = generateId()
      mockSeckillActivities.push({ ...formData })
      ElMessage.success('创建成功')
    }

    // 返回列表页
    router.push('/system/seckill')
  } catch (error) {
    console.error('验证失败:', error)
  } finally {
    saving.value = false
  }
}

// 取消
const handleCancel = () => {
  router.push('/system/seckill')
}

// 加载编辑数据
const loadEditData = () => {
  const editId = route.query.edit
  if (editId) {
    const seckill = mockSeckillActivities.find(item => item.id === editId)
    if (seckill) {
      Object.assign(formData, {
        id: seckill.id,
        name: seckill.name,
        date: seckill.date,
        description: seckill.description || '',
        status: seckill.status || 'draft',
        recommended: seckill.recommended || false,
        rules: seckill.rules || [],
        sessions: JSON.parse(JSON.stringify(seckill.sessions))
      })
    }
  }
}

// 初始化
onMounted(() => {
  if (isEdit.value) {
    loadEditData()
  } else {
    // 默认添加一个场次
    handleAddSession()
  }
})
</script>

<style scoped>
.seckill-form {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.seckill-form-content {
  max-width: 1200px;
}

.form-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  padding: 40px 0;
}

.session-item {
  margin-bottom: 20px;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-products {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 500;
  color: #606266;
}

.text-gray {
  color: #909399;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>
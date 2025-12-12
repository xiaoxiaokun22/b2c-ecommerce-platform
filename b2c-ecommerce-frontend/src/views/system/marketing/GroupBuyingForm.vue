<template>
  <div class="group-buying-form">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/system/group-buying' }">团购活动</el-breadcrumb-item>
        <el-breadcrumb-item>{{ isEdit ? '编辑' : '创建' }}团购活动</el-breadcrumb-item>
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
      class="group-buying-form-content"
    >
      <!-- 基本信息 -->
      <el-card class="form-section">
        <template #header>
          <span class="section-title">基本信息</span>
        </template>
        <el-form-item label="活动名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入活动名称，如：小米空气净化器团购"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="活动商品" prop="productId">
          <el-select
            v-model="formData.productId"
            placeholder="请选择商品"
            filterable
            style="width: 100%"
            @change="handleProductChange"
          >
            <el-option
              v-for="product in productOptions"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            >
              <span style="float: left">{{ product.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                ¥{{ product.price }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="原价" prop="originalPrice">
              <el-input-number
                v-model="formData.originalPrice"
                :min="0"
                :precision="2"
                placeholder="商品原价"
                style="width: 100%"
                :disabled="!!formData.productId"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="团购价" prop="groupPrice">
              <el-input-number
                v-model="formData.groupPrice"
                :min="0"
                :max="formData.originalPrice || 999999"
                :precision="2"
                placeholder="团购优惠价"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="dateTimeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%"
            @change="handleDateChange"
          />
        </el-form-item>
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

      <!-- 成团设置 -->
      <el-card class="form-section">
        <template #header>
          <span class="section-title">成团设置</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="成团人数" prop="groupSize">
              <el-input-number
                v-model="formData.groupSize"
                :min="2"
                :max="999"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最大开团数" prop="maxGroupCount">
              <el-input-number
                v-model="formData.maxGroupCount"
                :min="1"
                :max="9999"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="拼团时限(小时)" prop="groupValidHours">
              <el-input-number
                v-model="formData.rules.groupValidHours"
                :min="1"
                :max="168"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单人限购" prop="rules.maxParticipants">
              <el-input-number
                v-model="formData.rules.maxParticipants"
                :min="formData.rules.minParticipants || 1"
                :max="999"
                style="width: 100%"
                placeholder="0表示不限购"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前成团数">
              <el-input-number
                v-model="formData.currentGroupCount"
                :min="0"
                :max="formData.maxGroupCount"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
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
        <el-form-item label="优惠金额">
          <el-tag type="danger" size="large">
            省: ¥{{ (formData.originalPrice - formData.groupPrice).toFixed(2) }}
            <span style="margin-left: 10px">
              ({{
                formData.originalPrice
                  ? Math.round((1 - formData.groupPrice / formData.originalPrice) * 100)
                  : 0
              }}%OFF)
            </span>
          </el-tag>
        </el-form-item>
      </el-card>

      <!-- 规则说明 -->
      <el-card class="form-section">
        <template #header>
          <span class="section-title">规则说明</span>
        </template>
        <el-alert
          title="团购活动规则"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <ul style="margin: 0; padding-left: 20px;">
              <li>{{ formData.groupSize }}人成团，享受团购价</li>
              <li>拼团时限{{ formData.rules.groupValidHours }}小时，超时未成团自动退款</li>
              <li>每人限购{{ formData.rules.maxParticipants || '不限' }}件</li>
              <li>最多可开团{{ formData.maxGroupCount }}个</li>
            </ul>
          </template>
        </el-alert>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockGroupBuyingActivities } from '@/mock/marketing'

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
  { id: 'PRD006', name: '小米空气净化器 Pro H', price: 1499 },
  { id: 'PRD007', name: '戴森HD08吹风机', price: 2990 },
  { id: 'PRD008', name: '华为手环8', price: 269 },
  { id: 'PRD011', name: '美的电饭煲 MB-FB40S701', price: 399 },
  { id: 'PRD012', name: '九阳豆浆机 DJ13B-D08D', price: 299 },
  { id: 'PRD013', name: '苏泊尔电压力锅 CYSB50YCW10D', price: 599 }
])

// 日期时间范围
const dateTimeRange = ref<[Date, Date]>()

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  productId: '',
  productName: '',
  originalPrice: 0,
  groupPrice: 0,
  groupSize: 10,
  currentGroupSize: 0,
  maxGroupCount: 100,
  currentGroupCount: 0,
  startTime: '',
  endTime: '',
  status: 'draft',
  description: '',
  recommended: false,
  rules: {
    minParticipants: 0,
    maxParticipants: 0,
    groupValidHours: 24
  },
  totalOrders: 0,
  totalSavings: 0,
  creator: '',
  createTime: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  productId: [
    { required: true, message: '请选择商品', trigger: 'change' }
  ],
  originalPrice: [
    { required: true, message: '请输入原价', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '原价必须大于0', trigger: 'blur' }
  ],
  groupPrice: [
    { required: true, message: '请输入团购价', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '团购价必须大于0', trigger: 'blur' }
  ],
  groupSize: [
    { required: true, message: '请输入成团人数', trigger: 'blur' },
    { type: 'number', min: 2, message: '成团人数至少2人', trigger: 'blur' }
  ],
  maxGroupCount: [
    { required: true, message: '请输入最大开团数', trigger: 'blur' },
    { type: 'number', min: 1, message: '最大开团数至少1个', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择活动状态', trigger: 'change' }
  ]
}

// 商品选择变化
const handleProductChange = (productId: string) => {
  const selectedProduct = productOptions.value.find(p => p.id === productId)
  if (selectedProduct) {
    formData.productName = selectedProduct.name
    formData.originalPrice = selectedProduct.price
    formData.groupPrice = selectedProduct.price * 0.7 // 默认7折
    formData.rules.minParticipants = 2
  }
}

// 日期时间范围变化
const handleDateChange = (dates: [Date, Date]) => {
  if (dates) {
    formData.startTime = dates[0].toISOString()
    formData.endTime = dates[1].toISOString()
  }
}

// 生成唯一ID
const generateId = () => {
  return 'GROUP' + Date.now().toString(36).toUpperCase()
}

// 保存
const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 验证团购价必须小于原价
    if (formData.groupPrice >= formData.originalPrice) {
      ElMessage.error('团购价必须小于原价')
      return
    }

    saving.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (isEdit.value) {
      // 更新逻辑
      const index = mockGroupBuyingActivities.findIndex(item => item.id === formData.id)
      if (index > -1) {
        mockGroupBuyingActivities[index] = { ...formData }
      }
      ElMessage.success('更新成功')
    } else {
      // 创建逻辑
      formData.id = generateId()
      formData.creator = '团购运营'
      formData.createTime = new Date().toLocaleString('zh-CN')
      formData.rules.minParticipants = formData.groupSize
      mockGroupBuyingActivities.push({ ...formData })
      ElMessage.success('创建成功')
    }

    // 返回列表页
    router.push('/system/group-buying')
  } catch (error) {
    console.error('验证失败:', error)
  } finally {
    saving.value = false
  }
}

// 取消
const handleCancel = () => {
  router.push('/system/group-buying')
}

// 加载编辑数据
const loadEditData = () => {
  const editId = route.query.edit
  if (editId) {
    const groupBuying = mockGroupBuyingActivities.find(item => item.id === editId)
    if (groupBuying) {
      Object.assign(formData, {
        id: groupBuying.id,
        name: groupBuying.name,
        productId: groupBuying.productId,
        productName: groupBuying.productName,
        originalPrice: groupBuying.originalPrice,
        groupPrice: groupBuying.groupPrice,
        groupSize: groupBuying.groupSize,
        currentGroupSize: groupBuying.currentGroupSize || 0,
        maxGroupCount: groupBuying.maxGroupCount,
        currentGroupCount: groupBuying.currentGroupCount || 0,
        status: groupBuying.status || 'draft',
        description: groupBuying.description || '',
        recommended: groupBuying.recommended || false,
        rules: {
          minParticipants: groupBuying.rules?.minParticipants || groupBuying.groupSize,
          maxParticipants: groupBuying.rules?.maxParticipants || 0,
          groupValidHours: groupBuying.rules?.groupValidHours || 24
        },
        creator: groupBuying.creator,
        createTime: groupBuying.createTime
      })

      // 设置日期时间范围
      if (groupBuying.startTime && groupBuying.endTime) {
        dateTimeRange.value = [new Date(groupBuying.startTime), new Date(groupBuying.endTime)]
      }
    }
  }
}

// 监听成团人数变化
watch(() => formData.groupSize, (newVal) => {
  formData.rules.minParticipants = newVal
})

// 初始化
onMounted(() => {
  if (isEdit.value) {
    loadEditData()
  }
})
</script>

<style scoped>
.group-buying-form {
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

.group-buying-form-content {
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

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-alert) {
  margin-top: 10px;
}

:deep(.el-alert__content) {
  line-height: 1.6;
}

:deep(.el-tag) {
  font-size: 14px;
  padding: 8px 16px;
}
</style>
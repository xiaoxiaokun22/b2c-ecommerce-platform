<template>
  <div class="inventory-adjust">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>库存调整</h2>
      <div class="actions">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <!-- 调整申请表单 -->
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>库存调整申请</span>
          <el-tag :type="adjustForm.id ? 'info' : 'primary'">
            {{ adjustForm.id ? '编辑调整申请' : '新建调整申请' }}
          </el-tag>
        </div>
      </template>

      <el-form
        ref="adjustFormRef"
        :model="adjustForm"
        :rules="adjustRules"
        label-width="120px"
      >
        <!-- 选择商品 -->
        <el-form-item label="选择商品" prop="productId">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-input
                v-model="adjustForm.productCode"
                placeholder="输入商品编码"
                @change="handleProductSearch"
              >
                <template #append>
                  <el-button @click="handleShowProductSelect">选择商品</el-button>
                </template>
              </el-input>
            </el-col>
            <el-col :span="16">
              <div v-if="selectedProduct" class="product-info">
                <span class="product-name">{{ selectedProduct.productName }}</span>
                <span class="product-spec">{{ formatSpecifications(selectedProduct.specifications) }}</span>
                <span class="current-stock">当前库存: {{ selectedProduct.currentStock }}件</span>
              </div>
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 调整类型 -->
        <el-form-item label="调整类型" prop="adjustType">
          <el-radio-group v-model="adjustForm.adjustType">
            <el-radio value="increase">
              <el-icon><Plus /></el-icon>
              库存增加（盘盈）
            </el-radio>
            <el-radio value="decrease">
              <el-icon><Minus /></el-icon>
              库存减少（盘亏/报损）
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 调整方式 -->
        <el-form-item label="调整方式" prop="type">
          <el-select
            v-model="adjustForm.type"
            placeholder="请选择调整方式"
            style="width: 300px"
          >
            <el-option label="盘点调整" value="盘点调整" />
            <el-option label="报损调整" value="报损调整" />
            <el-option label="盘盈调整" value="盘盈调整" />
            <el-option label="调拨调整" value="调拨调整" />
            <el-option label="其他调整" value="其他调整" />
          </el-select>
        </el-form-item>

        <!-- 调整数量 -->
        <el-form-item label="调整数量" prop="adjustQuantity">
          <el-input-number
            v-model="adjustForm.adjustQuantity"
            :min="1"
            :max="selectedProduct ? selectedProduct.currentStock : 999999"
            style="width: 200px"
          />
          <span class="quantity-hint">
            {{ adjustForm.adjustType === 'increase' ? '增加' : '减少' }}库存数量
          </span>
        </el-form-item>

        <!-- 调整后库存 -->
        <el-form-item label="调整后库存">
          <span class="after-stock">
            {{ calculateAfterStock }}件
          </span>
          <el-tag
            v-if="selectedProduct"
            :type="getAfterStockType()"
            style="margin-left: 10px"
          >
            {{ getAfterStockStatus() }}
          </el-tag>
        </el-form-item>

        <!-- 调整原因 -->
        <el-form-item label="调整原因" prop="reason">
          <el-input
            v-model="adjustForm.reason"
            placeholder="请简要说明调整原因"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <!-- 详细说明 -->
        <el-form-item label="详细说明" prop="description">
          <el-input
            v-model="adjustForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细说明调整原因和背景"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- 附件上传 -->
        <el-form-item label="相关附件">
          <el-upload
            ref="uploadRef"
            :file-list="fileList"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            multiple
            action="#"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择文件
            </el-button>
            <template #tip>
              <div class="upload-tip">
                支持上传图片、PDF等格式文件，单个文件不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 审批人 -->
        <el-form-item label="审批人" prop="approver">
          <el-select
            v-model="adjustForm.approver"
            placeholder="请选择审批人"
            style="width: 300px"
            filterable
          >
            <el-option
              v-for="user in approverList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            >
              <span>{{ user.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ user.role }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            <el-icon><Check /></el-icon>
            提交申请
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleSaveDraft">保存草稿</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 调整记录 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>最近调整记录</span>
          <el-button type="text" @click="handleViewMore">查看更多</el-button>
        </div>
      </template>

      <el-table :data="recentRecords" border>
        <el-table-column prop="id" label="申请编号" width="150" />
        <el-table-column prop="productName" label="商品名称" min-width="200" />
        <el-table-column prop="adjustType" label="调整类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.adjustType === 'increase' ? 'success' : 'danger'" size="small">
              {{ row.adjustType === 'increase' ? '增加' : '减少' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="adjustQuantity" label="调整数量" width="100" align="right">
          <template #default="{ row }">
            <span :class="row.adjustType === 'increase' ? 'text-success' : 'text-danger'">
              {{ row.adjustType === 'increase' ? '+' : '-' }}{{ row.adjustQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="调整原因" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicantTime" label="申请时间" width="160" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewRecord(row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 商品选择对话框 -->
    <el-dialog
      v-model="productSelectVisible"
      title="选择商品"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form inline class="product-search-form">
        <el-form-item label="商品编码">
          <el-input v-model="productSearchForm.code" placeholder="输入商品编码" clearable />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="productSearchForm.name" placeholder="输入商品名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearchProduct">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="productList" @row-click="handleSelectProduct">
        <el-table-column prop="productCode" label="商品编码" width="150" />
        <el-table-column prop="productName" label="商品名称" min-width="200" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="currentStock" label="当前库存" width="100" align="right" />
        <el-table-column prop="warehouse" label="仓库" width="100" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Plus, Minus, Upload, Check
} from '@element-plus/icons-vue'
import { mockInventoryList, mockInventoryAdjustments } from '@/mock/inventory'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const productSelectVisible = ref(false)
const selectedProduct = ref<any>(null)
const productList = ref<any[]>([])
const fileList = ref<any[]>([])
const adjustFormRef = ref()
const uploadRef = ref()

// 调整表单
const adjustForm = reactive({
  id: '',
  inventoryId: '',
  productCode: '',
  adjustType: 'decrease' as 'increase' | 'decrease',
  type: '',
  adjustQuantity: 1,
  reason: '',
  description: '',
  approver: '',
  attachments: [] as string[]
})

// 表单验证规则
const adjustRules = {
  productId: [
    { required: true, message: '请选择要调整的商品', trigger: 'change' }
  ],
  adjustType: [
    { required: true, message: '请选择调整类型', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择调整方式', trigger: 'change' }
  ],
  adjustQuantity: [
    { required: true, message: '请输入调整数量', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入调整原因', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入详细说明', trigger: 'blur' }
  ],
  approver: [
    { required: true, message: '请选择审批人', trigger: 'change' }
  ]
}

// 商品搜索表单
const productSearchForm = reactive({
  code: '',
  name: ''
})

// 审批人列表
const approverList = [
  { id: 'user001', name: '张经理', role: '库存主管' },
  { id: 'user002', name: '李主管', role: '运营主管' },
  { id: 'user003', name: '王总监', role: '运营总监' }
]

// 最近调整记录
const recentRecords = ref<any[]>([])

// 格式化规格信息
const formatSpecifications = (specs: any) => {
  if (!specs) return ''
  return Object.values(specs).join(' / ')
}

// 计算调整后库存
const calculateAfterStock = computed(() => {
  if (!selectedProduct.value) return 0
  const current = selectedProduct.value.currentStock
  const quantity = adjustForm.adjustQuantity
  return adjustForm.adjustType === 'increase' ? current + quantity : current - quantity
})

// 获取调整后库存状态类型
const getAfterStockType = () => {
  const afterStock = calculateAfterStock.value
  if (afterStock === 0) return 'info'
  if (afterStock < (selectedProduct.value?.safetyStock || 0)) return 'warning'
  return 'success'
}

// 获取调整后库存状态文本
const getAfterStockStatus = () => {
  const afterStock = calculateAfterStock.value
  if (afterStock === 0) return '售罄'
  if (afterStock < (selectedProduct.value?.safetyStock || 0)) return '低于安全库存'
  return '正常'
}

// 搜索商品
const handleProductSearch = () => {
  const product = mockInventoryList.find(item =>
    item.productCode.toLowerCase() === adjustForm.productCode.toLowerCase()
  )

  if (product) {
    selectedProduct.value = product
    adjustForm.inventoryId = product.id
  } else {
    ElMessage.warning('未找到该商品')
    selectedProduct.value = null
    adjustForm.inventoryId = ''
  }
}

// 显示商品选择
const handleShowProductSelect = () => {
  productSelectVisible.value = true
  productList.value = mockInventoryList
}

// 搜索商品
const handleSearchProduct = () => {
  let filtered = [...mockInventoryList]

  if (productSearchForm.code) {
    filtered = filtered.filter(item =>
      item.productCode.toLowerCase().includes(productSearchForm.code.toLowerCase())
    )
  }

  if (productSearchForm.name) {
    filtered = filtered.filter(item =>
      item.productName.toLowerCase().includes(productSearchForm.name.toLowerCase())
    )
  }

  productList.value = filtered
}

// 选择商品
const handleSelectProduct = (row: any) => {
  selectedProduct.value = row
  adjustForm.productCode = row.productCode
  adjustForm.inventoryId = row.id
  productSelectVisible.value = false
}

// 文件变化
const handleFileChange = (file: any) => {
  // 模拟文件上传
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }
  return true
}

// 文件移除
const handleFileRemove = (file: any) => {
  const index = fileList.value.indexOf(file)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status] || '未知'
}

// 提交申请
const handleSubmit = async () => {
  if (!adjustFormRef.value) return

  try {
    await adjustFormRef.value.validate()

    submitting.value = true

    // 构建提交数据
    const submitData = {
      ...adjustForm,
      beforeStock: selectedProduct.value?.currentStock,
      afterStock: calculateAfterStock.value,
      applicant: '当前用户',
      applicantTime: new Date().toISOString()
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('库存调整申请提交成功')
    router.push('/system/inventory')

  } catch (error) {
    // 表单验证失败
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (adjustFormRef.value) {
    adjustFormRef.value.resetFields()
  }
  selectedProduct.value = null
  fileList.value = []
  adjustForm.adjustType = 'decrease'
  adjustForm.adjustQuantity = 1
}

// 保存草稿
const handleSaveDraft = () => {
  ElMessage.success('草稿保存成功')
}

// 返回
const handleBack = () => {
  router.back()
}

// 查看更多记录
const handleViewMore = () => {
  router.push('/system/inventory/adjust?tab=records')
}

// 查看记录详情
const handleViewRecord = (row: any) => {
  ElMessage.info(`查看调整记录 ${row.id} 详情`)
}

// 加载调整记录
const loadRecentRecords = () => {
  recentRecords.value = mockInventoryAdjustments.slice(0, 5).map(item => ({
    ...item,
    productName: mockInventoryList.find(p => p.id === item.inventoryId)?.productName || '未知商品'
  }))
}

// 初始化
onMounted(() => {
  // 检查是否有编辑的ID
  if (route.query.id) {
    adjustForm.id = route.query.id as string
    // TODO: 加载编辑数据
  }

  loadRecentRecords()
})
</script>

<style scoped>
.inventory-adjust {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #606266;
}

.product-name {
  font-weight: 500;
  color: #303133;
}

.product-spec {
  font-size: 14px;
  color: #909399;
}

.current-stock {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

.quantity-hint {
  margin-left: 10px;
  color: #909399;
  font-size: 14px;
}

.after-stock {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.text-success {
  color: #67c23a;
  font-weight: 500;
}

.text-danger {
  color: #f56c6c;
  font-weight: 500;
}

.product-search-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>
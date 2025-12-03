<template>
  <div class="review-management">
    <div class="page-header">
      <div class="header-content">
        <h2>商品评价管理</h2>
        <p>管理用户商品评价，支持审核、筛选、统计和回复功能</p>
      </div>
      <div class="header-actions">
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出评价
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #e7f7ff; color: #409eff;">
                <el-icon size="24"><ChatDotRound /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.total }}</div>
                <div class="stat-label">总评价数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #f0f9ff; color: #67c23a;">
                <el-icon size="24"><Check /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.approved }}</div>
                <div class="stat-label">已通过</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #fef0f0; color: #f56c6c;">
                <el-icon size="24"><Close /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.rejected }}</div>
                <div class="stat-label">已拒绝</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #fdf6ec; color: #e6a23c;">
                <el-icon size="24"><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.pending }}</div>
                <div class="stat-label">待审核</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-container">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入商品名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="评价状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="评分">
          <el-select v-model="searchForm.rating" placeholder="请选择评分" clearable style="width: 120px">
            <el-option label="5星" :value="5" />
            <el-option label="4星" :value="4" />
            <el-option label="3星" :value="3" />
            <el-option label="2星" :value="2" />
            <el-option label="1星" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否有图">
          <el-select v-model="searchForm.hasImages" placeholder="请选择" clearable style="width: 120px">
            <el-option label="有图" :value="true" />
            <el-option label="无图" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="评价时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
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
        :title="`已选择 ${selectedRows.length} 个评价`"
        type="info"
        show-icon
        :closable="false"
      >
        <template #default>
          <el-button type="success" size="small" @click="handleBatchApprove">
            批量通过
          </el-button>
          <el-button type="danger" size="small" @click="handleBatchReject">
            批量拒绝
          </el-button>
        </template>
      </el-alert>
    </div>

    <!-- 评价列表 -->
    <div class="table-container">
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div class="product-info">
              <el-image
                :src="row.productImage"
                :preview-src-list="[row.productImage]"
                fit="cover"
                class="product-image"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="product-details">
                <div class="product-name">{{ row.productName }}</div>
                <div class="product-sku">{{ row.skuName }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" width="150">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.userAvatar">
                {{ row.userNickname?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="user-details">
                <div class="user-name">{{ row.userNickname }}</div>
                <div class="user-phone">{{ maskPhone(row.userPhone) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="120" align="center">
          <template #default="{ row }">
            <div class="rating-display">
              <el-rate
                v-model="row.rating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="评价内容" min-width="250">
          <template #default="{ row }">
            <div class="review-content">
              <div class="review-text">{{ row.content }}</div>
              <div v-if="row.images && row.images.length > 0" class="review-images">
                <el-image
                  v-for="(image, index) in row.images"
                  :key="index"
                  :src="image"
                  :preview-src-list="row.images"
                  fit="cover"
                  class="review-image"
                />
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商家回复" min-width="200">
          <template #default="{ row }">
            <div v-if="row.merchantReply" class="merchant-reply">
              <div class="reply-content">{{ row.merchantReply.content }}</div>
              <div class="reply-time">{{ row.merchantReply.createdAt }}</div>
            </div>
            <div v-else class="no-reply">
              <el-button type="primary" size="small" @click="handleReply(row)">
                回复
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="评价时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="table-action-buttons" data-buttons="4">
              <el-button type="primary" link @click="handleView(row)">
                <el-icon><View /></el-icon>
                <span>查看</span>
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="success"
                link
                @click="handleApprove(row)"
              >
                <el-icon><Check /></el-icon>
                <span>通过</span>
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="danger"
                link
                @click="handleReject(row)"
              >
                <el-icon><Close /></el-icon>
                <span>拒绝</span>
              </el-button>
              <el-button type="warning" link @click="handleReply(row)">
                <el-icon><ChatDotRound /></el-icon>
                <span>回复</span>
              </el-button>
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

    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      title="商家回复"
      width="600px"
    >
      <div v-if="currentReview" class="review-preview">
        <div class="review-item">
          <div class="review-header">
            <span class="review-user">{{ currentReview.userNickname }}</span>
            <el-rate v-model="currentReview.rating" disabled size="small" />
          </div>
          <div class="review-content-text">{{ currentReview.content }}</div>
          <div v-if="currentReview.images?.length > 0" class="review-preview-images">
            <el-image
              v-for="(image, index) in currentReview.images"
              :key="index"
              :src="image"
              :preview-src-list="currentReview.images"
              fit="cover"
              class="preview-image"
            />
          </div>
        </div>
      </div>

      <el-form
        ref="replyFormRef"
        :model="replyForm"
        :rules="replyRules"
        label-width="80px"
      >
        <el-form-item label="回复内容" prop="content">
          <el-input
            v-model="replyForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入回复内容"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitReply" :loading="replySubmitting">
            提交回复
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Download,
  ChatDotRound,
  Check,
  Close,
  Clock,
  Search,
  Refresh,
  Picture,
  View
} from '@element-plus/icons-vue'

// 类型定义
interface Review {
  id: number
  productId: number
  productName: string
  skuName: string
  productImage: string
  userId: number
  userNickname: string
  userPhone: string
  userAvatar: string
  rating: number
  content: string
  images: string[]
  status: 'pending' | 'approved' | 'rejected'
  merchantReply?: {
    content: string
    createdAt: string
  }
  createdAt: string
}

interface ReplyForm {
  content: string
}

// 响应式数据
const loading = ref(false)
const replySubmitting = ref(false)
const replyDialogVisible = ref(false)
const currentReview = ref<Review | null>(null)
const selectedRows = ref<Review[]>([])
const tableData = ref<Review[]>([])
const replyFormRef = ref<FormInstance>()

// 统计数据
const stats = reactive({
  total: 1256,
  approved: 1023,
  rejected: 45,
  pending: 188
})

// 搜索表单
const searchForm = reactive({
  productName: '',
  status: '',
  rating: null as number | null,
  hasImages: null as boolean | null,
  dateRange: null as [string, string] | null
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 回复表单
const replyForm = reactive<ReplyForm>({
  content: ''
})

// 表单验证规则
const replyRules: FormRules = {
  content: [
    { required: true, message: '请输入回复内容', trigger: 'blur' },
    { min: 5, max: 500, message: '回复内容长度在 5 到 500 个字符', trigger: 'blur' }
  ]
}

// 方法
const loadReviews = async () => {
  loading.value = true
  try {
    // 这里应该调用实际的API
    // const response = await reviewApi.getReviews({
    //   ...searchForm,
    //   page: pagination.page,
    //   size: pagination.size
    // })

    // 模拟数据
    const mockData: Review[] = [
      {
        id: 1,
        productId: 1,
        productName: 'iPhone 15 Pro Max',
        skuName: '黑色 256GB',
        productImage: 'https://via.placeholder.com/60x60',
        userId: 1,
        userNickname: '张三',
        userPhone: '13812345678',
        userAvatar: 'https://via.placeholder.com/32x32',
        rating: 5,
        content: '手机很不错，拍照清晰，运行流畅，物流也很快，客服态度很好！',
        images: [
          'https://via.placeholder.com/100x100',
          'https://via.placeholder.com/100x100',
          'https://via.placeholder.com/100x100'
        ],
        status: 'approved',
        merchantReply: {
          content: '感谢您的认可！我们会继续提供优质的服务。',
          createdAt: '2024-01-02 10:30:00'
        },
        createdAt: '2024-01-01 09:15:00'
      },
      {
        id: 2,
        productId: 2,
        productName: 'Samsung Galaxy S24 Ultra',
        skuName: '银色 512GB',
        productImage: 'https://via.placeholder.com/60x60',
        userId: 2,
        userNickname: '李四',
        userPhone: '13887654321',
        userAvatar: '',
        rating: 4,
        content: '手机整体不错，就是价格有点贵，希望能有更多优惠活动。',
        images: [],
        status: 'pending',
        createdAt: '2024-01-02 14:20:00'
      },
      {
        id: 3,
        productId: 3,
        productName: 'MacBook Pro 16"',
        skuName: '深空灰 1TB',
        productImage: 'https://via.placeholder.com/60x60',
        userId: 3,
        userNickname: '王五',
        userPhone: '13666666666',
        userAvatar: 'https://via.placeholder.com/32x32',
        rating: 3,
        content: '性能很好，但是发热有点严重，希望能改进。',
        images: ['https://via.placeholder.com/100x100'],
        status: 'rejected',
        createdAt: '2024-01-03 16:45:00'
      }
    ]

    tableData.value = mockData
    pagination.total = 1256
  } catch (error) {
    ElMessage.error('加载评价数据失败')
  } finally {
    loading.value = false
  }
}

const maskPhone = (phone: string) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const getStatusType = (status: string) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status as keyof typeof typeMap] || 'info'
}

const getStatusText = (status: string) => {
  const textMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status as keyof typeof textMap] || status
}

const handleSearch = () => {
  pagination.page = 1
  loadReviews()
}

const handleReset = () => {
  Object.assign(searchForm, {
    productName: '',
    status: '',
    rating: null,
    hasImages: null,
    dateRange: null
  })
  handleSearch()
}

const handleView = (row: Review) => {
  ElMessage.info(`查看评价详情：${row.userNickname} 对 ${row.productName} 的评价`)
}

const handleApprove = async (row: Review) => {
  try {
    await ElMessageBox.confirm(
      `确定要通过用户"${row.userNickname}"对商品"${row.productName}"的评价吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 这里应该调用实际的API
    // await reviewApi.approveReview(row.id)

    ElMessage.success('审核通过')
    loadReviews()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleReject = async (row: Review) => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      `请输入拒绝用户"${row.userNickname}"评价的理由：`,
      '拒绝评价',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '请输入拒绝理由'
      }
    )

    if (!reason) {
      ElMessage.warning('请输入拒绝理由')
      return
    }

    // 这里应该调用实际的API
    // await reviewApi.rejectReview(row.id, reason)

    ElMessage.success('已拒绝该评价')
    loadReviews()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleReply = (row: Review) => {
  currentReview.value = row
  replyForm.content = row.merchantReply?.content || ''
  replyDialogVisible.value = true
}

const handleSubmitReply = async () => {
  if (!replyFormRef.value || !currentReview.value) return

  try {
    await replyFormRef.value.validate()
    replySubmitting.value = true

    // 这里应该调用实际的API
    // await reviewApi.replyReview(currentReview.value.id, replyForm.content)

    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    loadReviews()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('回复失败')
    }
  } finally {
    replySubmitting.value = false
  }
}

const handleSelectionChange = (selection: Review[]) => {
  selectedRows.value = selection
}

const handleBatchApprove = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要通过选中的 ${selectedRows.value.length} 个评价吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 这里应该调用实际的API
    // await reviewApi.batchApprove(selectedRows.value.map(r => r.id))

    ElMessage.success('批量审核通过')
    selectedRows.value = []
    loadReviews()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleBatchReject = async () => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      `请输入拒绝选中的 ${selectedRows.value.length} 个评价的理由：`,
      '批量拒绝评价',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '请输入拒绝理由'
      }
    )

    if (!reason) {
      ElMessage.warning('请输入拒绝理由')
      return
    }

    // 这里应该调用实际的API
    // await reviewApi.batchReject(selectedRows.value.map(r => r.id), reason)

    ElMessage.success('批量拒绝成功')
    selectedRows.value = []
    loadReviews()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadReviews()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadReviews()
}

// 生命周期
onMounted(() => {
  loadReviews()
})
</script>

<style scoped>
@import '@/styles/table-actions.css';

.review-management {
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

.stats-container {
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
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

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.product-sku {
  font-size: 12px;
  color: #909399;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.user-phone {
  font-size: 12px;
  color: #909399;
}

.rating-display {
  display: flex;
  justify-content: center;
}

.review-content {
  max-width: 300px;
}

.review-text {
  margin-bottom: 8px;
  color: #303133;
  line-height: 1.5;
}

.review-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.review-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.merchant-reply {
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.reply-content {
  color: #303133;
  margin-bottom: 4px;
  line-height: 1.4;
}

.reply-time {
  font-size: 12px;
  color: #909399;
}

.no-reply {
  display: flex;
  justify-content: center;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.review-preview {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.review-item {
  margin-bottom: 16px;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.review-user {
  font-weight: 500;
  color: #303133;
}

.review-content-text {
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
}

.review-preview-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
}

.image-error {
  width: 100%;
  height: 100%;
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

:deep(.el-card__body) {
  padding: 20px;
}

@media (max-width: 768px) {
  .stats-container .el-col {
    margin-bottom: 16px;
  }

  .search-container .el-form-item {
    margin-bottom: 12px;
  }

  .product-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
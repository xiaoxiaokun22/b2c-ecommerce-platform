<template>
  <div class="order-detail" v-loading="loading">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button type="text" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回订单列表
      </el-button>
      <div class="header-actions">
        <el-button type="primary" @click="printOrder">
          <el-icon><Printer /></el-icon>
          打印订单
        </el-button>
        <el-button @click="exportOrder">
          <el-icon><Download /></el-icon>
          导出订单
        </el-button>
      </div>
    </div>

    <!-- 订单详情内容 -->
    <div v-if="orderDetail" class="order-content">
      <!-- 订单基本信息 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <h3>订单基本信息</h3>
            <el-tag :type="getStatusType(orderDetail.status)" size="large">
              {{ getStatusLabel(orderDetail.status) }}
            </el-tag>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="订单号">
            <span class="order-no">{{ orderDetail.orderNo }}</span>
            <el-button type="text" size="small" @click="copyOrderNo">复制</el-button>
          </el-descriptions-item>
          <el-descriptions-item label="用户信息">
            <div>{{ orderDetail.userName }}</div>
            <div class="text-gray-500">{{ orderDetail.userPhone }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">
            {{ orderDetail.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            <el-tag :type="getPaymentMethodType(orderDetail.paymentMethod)">
              {{ getPaymentMethodLabel(orderDetail.paymentMethod) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付时间" v-if="orderDetail.payTime">
            {{ orderDetail.payTime }}
          </el-descriptions-item>
          <el-descriptions-item label="发货时间" v-if="orderDetail.shipTime">
            {{ orderDetail.shipTime }}
          </el-descriptions-item>
          <el-descriptions-item label="收货时间" v-if="orderDetail.receiveTime">
            {{ orderDetail.receiveTime }}
          </el-descriptions-item>
          <el-descriptions-item label="完成时间" v-if="orderDetail.completeTime">
            {{ orderDetail.completeTime }}
          </el-descriptions-item>
          <el-descriptions-item label="取消时间" v-if="orderDetail.cancelTime">
            {{ orderDetail.cancelTime }}
          </el-descriptions-item>
          <el-descriptions-item label="订单备注" v-if="orderDetail.remark" :span="3">
            <el-text type="info">{{ orderDetail.remark }}</el-text>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 商品信息 -->
      <el-card class="detail-card">
        <template #header>
          <h3>商品信息</h3>
        </template>
        <el-table :data="orderDetail.items" border>
          <el-table-column prop="productName" label="商品名称" min-width="200">
            <template #default="{ row }">
              <div class="product-info">
                <el-image
                  :src="row.productImage"
                  style="width: 60px; height: 60px; margin-right: 12px"
                  fit="cover"
                  :preview-src-list="[row.productImage]"
                />
                <div>
                  <div class="product-name">{{ row.productName }}</div>
                  <div class="text-gray-500 text-sm">{{ row.skuName }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="skuPrice" label="单价" width="120">
            <template #default="{ row }">
              ￥{{ row.skuPrice.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column prop="totalPrice" label="小计" width="120">
            <template #default="{ row }">
              ￥{{ row.totalPrice.toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 费用汇总 -->
        <div class="price-summary">
          <div class="price-item">
            <span>商品总价：</span>
            <span>￥{{ orderDetail.totalAmount.toFixed(2) }}</span>
          </div>
          <div class="price-item" v-if="orderDetail.discountAmount > 0">
            <span>优惠金额：</span>
            <span class="text-red-500">-￥{{ orderDetail.discountAmount.toFixed(2) }}</span>
          </div>
          <div class="price-item">
            <span>运费：</span>
            <span>￥{{ orderDetail.shippingFee.toFixed(2) }}</span>
          </div>
          <div class="price-item total">
            <span>实付金额：</span>
            <span class="total-amount">￥{{ orderDetail.actualAmount.toFixed(2) }}</span>
          </div>
        </div>
      </el-card>

      <!-- 收货信息 -->
      <el-card class="detail-card">
        <template #header>
          <h3>收货信息</h3>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="收货人">
            {{ orderDetail.address.receiverName }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ orderDetail.address.receiverPhone }}
          </el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ orderDetail.address.province }} {{ orderDetail.address.city }}
            {{ orderDetail.address.district }} {{ orderDetail.address.address }}
          </el-descriptions-item>
          <el-descriptions-item label="邮政编码" v-if="orderDetail.address.zipCode">
            {{ orderDetail.address.zipCode }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 物流信息 -->
      <el-card class="detail-card" v-if="orderDetail.logistics">
        <template #header>
          <h3>物流信息</h3>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="物流公司">
            {{ orderDetail.logistics.companyName }}
          </el-descriptions-item>
          <el-descriptions-item label="物流单号">
            <span>{{ orderDetail.logistics.trackingNumber }}</span>
            <el-button type="text" size="small" @click="copyTrackingNumber">复制</el-button>
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ orderDetail.logistics.lastUpdate }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 物流轨迹 -->
        <div class="logistics-timeline">
          <el-timeline>
            <el-timeline-item
              v-for="(trace, index) in orderDetail.logistics.traces"
              :key="index"
              :timestamp="trace.time"
              :type="index === 0 ? 'primary' : ''"
            >
              <div class="trace-content">
                <div class="trace-status">{{ trace.status }}</div>
                <div class="trace-description">{{ trace.description }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          v-if="orderDetail.status === OrderStatus.PENDING_REVIEW"
          type="success"
          @click="handleAudit"
        >
          订单审核
        </el-button>
        <el-button
          v-if="orderDetail.status === OrderStatus.PENDING_SHIPMENT"
          type="primary"
          @click="handleShip"
        >
          订单发货
        </el-button>
        <el-button
          v-if="orderDetail.status === OrderStatus.PENDING_PAYMENT"
          type="danger"
          @click="handleCancel"
        >
          取消订单
        </el-button>
        <el-button
          v-if="orderDetail.status === OrderStatus.EXCEPTION"
          type="warning"
          @click="handleException"
        >
          处理异常
        </el-button>
        <el-button @click="addRemark">添加备注</el-button>
      </div>
    </div>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="auditDialog.visible"
      :title="auditDialog.title"
      width="500px"
    >
      <el-form :model="auditDialog.form" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditDialog.form.approved">
            <el-radio :label="true">通过</el-radio>
            <el-radio :label="false">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input
            v-model="auditDialog.form.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmAudit">确认</el-button>
      </template>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog
      v-model="shipDialog.visible"
      title="订单发货"
      width="600px"
    >
      <el-form :model="shipDialog.form" :rules="shipDialog.rules" ref="shipFormRef" label-width="100px">
        <el-form-item label="物流公司" prop="companyName">
          <el-select
            v-model="shipDialog.form.companyName"
            placeholder="请选择物流公司"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="company in logisticsCompanies"
              :key="company.code"
              :label="company.name"
              :value="company.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" prop="trackingNumber">
          <el-input
            v-model="shipDialog.form.trackingNumber"
            placeholder="请输入物流单号"
          />
        </el-form-item>
        <el-form-item label="发货备注">
          <el-input
            v-model="shipDialog.form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入发货备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmShip">确认发货</el-button>
      </template>
    </el-dialog>

    <!-- 异常处理对话框 -->
    <el-dialog
      v-model="exceptionDialog.visible"
      title="异常订单处理"
      width="500px"
    >
      <el-form :model="exceptionDialog.form" label-width="100px">
        <el-form-item label="处理方式">
          <el-radio-group v-model="exceptionDialog.form.action">
            <el-radio value="resolve">恢复正常</el-radio>
            <el-radio value="cancel">取消订单</el-radio>
            <el-radio value="refund">全额退款</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input
            v-model="exceptionDialog.form.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入处理说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="exceptionDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmException">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { ArrowLeft, Printer, Download } from '@element-plus/icons-vue'
import { orderApi } from '@/api/order'
import { OrderStatus, PaymentMethod, type Order } from '@/types/order'

const router = useRouter()
const route = useRoute()

// 数据状态
const orderDetail = ref<Order | null>(null)
const loading = ref(false)

// 物流公司选项
const logisticsCompanies = [
  { code: 'SF', name: '顺丰速运' },
  { code: 'YTO', name: '圆通速递' },
  { code: 'ZTO', name: '中通快递' },
  { code: 'STO', name: '申通快递' },
  { code: 'YD', name: '韵达快递' },
  { code: 'JD', name: '京东快递' },
  { code: 'EMS', name: 'EMS' },
  { code: 'BEST', name: '百世快递' }
]

// 审核对话框
const auditDialog = reactive({
  visible: false,
  title: '',
  form: {
    approved: true,
    remark: ''
  }
})

// 发货对话框
const shipDialog = reactive({
  visible: false,
  form: {
    companyName: '',
    trackingNumber: '',
    remark: ''
  },
  rules: {
    companyName: [{ required: true, message: '请选择物流公司', trigger: 'change' }],
    trackingNumber: [{ required: true, message: '请输入物流单号', trigger: 'blur' }]
  }
})

// 异常处理对话框
const exceptionDialog = reactive({
  visible: false,
  form: {
    action: 'resolve',
    remark: ''
  }
})

const shipFormRef = ref<FormInstance>()

// 获取订单详情
const getOrderDetail = async () => {
  const orderId = Number(route.params.id)
  if (!orderId) {
    ElMessage.error('订单ID不存在')
    router.back()
    return
  }

  loading.value = true
  try {
    const response = await orderApi.getOrderDetail(orderId)
    if (response.code === 200) {
      orderDetail.value = response.data
    } else {
      ElMessage.error(response.message)
      router.back()
    }
  } catch (error) {
    ElMessage.error('获取订单详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 复制订单号
const copyOrderNo = async () => {
  if (!orderDetail.value) return

  try {
    await navigator.clipboard.writeText(orderDetail.value.orderNo)
    ElMessage.success('订单号已复制')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 复制物流单号
const copyTrackingNumber = async () => {
  if (!orderDetail.value?.logistics) return

  try {
    await navigator.clipboard.writeText(orderDetail.value.logistics.trackingNumber)
    ElMessage.success('物流单号已复制')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 打印订单
const printOrder = () => {
  window.print()
}

// 导出订单
const exportOrder = () => {
  ElMessage.info('导出功能开发中...')
}

// 处理审核
const handleAudit = () => {
  if (!orderDetail.value) return

  auditDialog.title = `审核订单 - ${orderDetail.value.orderNo}`
  auditDialog.form = {
    approved: true,
    remark: ''
  }
  auditDialog.visible = true
}

// 确认审核
const confirmAudit = async () => {
  if (!orderDetail.value) return

  try {
    const response = await orderApi.auditOrder(
      orderDetail.value.id,
      auditDialog.form.approved,
      auditDialog.form.remark
    )
    if (response.code === 200) {
      ElMessage.success(response.message)
      auditDialog.visible = false
      await getOrderDetail()
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    ElMessage.error('审核失败')
  }
}

// 处理发货
const handleShip = () => {
  if (!orderDetail.value) return

  shipDialog.form = {
    companyName: '',
    trackingNumber: '',
    remark: ''
  }
  shipDialog.visible = true
}

// 确认发货
const confirmShip = async () => {
  if (!shipFormRef.value || !orderDetail.value) return

  try {
    await shipFormRef.value.validate()

    const logisticsInfo = {
      companyCode: logisticsCompanies.find(c => c.name === shipDialog.form.companyName)?.code || '',
      companyName: shipDialog.form.companyName,
      trackingNumber: shipDialog.form.trackingNumber
    }

    const response = await orderApi.shipOrder(orderDetail.value.id, logisticsInfo)
    if (response.code === 200) {
      ElMessage.success(response.message)
      shipDialog.visible = false
      await getOrderDetail()
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    ElMessage.error('发货失败')
  }
}

// 处理取消订单
const handleCancel = async () => {
  if (!orderDetail.value) return

  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '确认取消', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const { value: reason } = await ElMessageBox.prompt('请输入取消原因', '取消订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入取消原因'
    })

    const response = await orderApi.cancelOrder(orderDetail.value.id, reason)
    if (response.code === 200) {
      ElMessage.success(response.message)
      await getOrderDetail()
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    // 用户取消操作
  }
}

// 处理异常订单
const handleException = () => {
  if (!orderDetail.value) return

  exceptionDialog.form = {
    action: 'resolve',
    remark: ''
  }
  exceptionDialog.visible = true
}

// 确认处理异常
const confirmException = async () => {
  if (!orderDetail.value) return

  try {
    const response = await orderApi.handleExceptionOrder(
      orderDetail.value.id,
      exceptionDialog.form.action,
      exceptionDialog.form.remark
    )
    if (response.code === 200) {
      ElMessage.success(response.message)
      exceptionDialog.visible = false
      await getOrderDetail()
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    ElMessage.error('处理失败')
  }
}

// 添加备注
const addRemark = async () => {
  if (!orderDetail.value) return

  try {
    const { value: remark } = await ElMessageBox.prompt('请输入备注信息', '添加备注', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入备注信息'
    })

    ElMessage.success('备注添加成功')
    // 这里应该调用添加备注的API
  } catch (error) {
    // 用户取消操作
  }
}

// 获取状态标签
const getStatusLabel = (status: OrderStatus) => {
  const statusMap = {
    [OrderStatus.PENDING_PAYMENT]: '待付款',
    [OrderStatus.PENDING_REVIEW]: '待审核',
    [OrderStatus.PENDING_SHIPMENT]: '待发货',
    [OrderStatus.SHIPPED]: '已发货',
    [OrderStatus.DELIVERED]: '已收货',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消',
    [OrderStatus.REFUNDING]: '退款中',
    [OrderStatus.REFUNDED]: '已退款',
    [OrderStatus.EXCEPTION]: '异常订单'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态类型
const getStatusType = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING_PAYMENT:
      return 'warning'
    case OrderStatus.PENDING_REVIEW:
      return 'info'
    case OrderStatus.PENDING_SHIPMENT:
      return ''
    case OrderStatus.SHIPPED:
      return 'success'
    case OrderStatus.DELIVERED:
      return 'success'
    case OrderStatus.COMPLETED:
      return 'success'
    case OrderStatus.CANCELLED:
      return 'danger'
    case OrderStatus.REFUNDING:
      return 'warning'
    case OrderStatus.REFUNDED:
      return 'info'
    case OrderStatus.EXCEPTION:
      return 'danger'
    default:
      return 'info'
  }
}

// 获取支付方式标签
const getPaymentMethodLabel = (method: PaymentMethod) => {
  const methodMap = {
    [PaymentMethod.ALIPAY]: '支付宝',
    [PaymentMethod.WECHAT]: '微信支付',
    [PaymentMethod.BALANCE]: '余额支付',
    [PaymentMethod.BANK_CARD]: '银行卡'
  }
  return methodMap[method] || '未知方式'
}

// 获取支付方式类型
const getPaymentMethodType = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.ALIPAY:
      return 'primary'
    case PaymentMethod.WECHAT:
      return 'success'
    case PaymentMethod.BALANCE:
      return 'warning'
    case PaymentMethod.BANK_CARD:
      return 'info'
    default:
      return 'info'
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getOrderDetail()
})
</script>

<style scoped>
.order-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}

.order-no {
  font-weight: bold;
  color: #409eff;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.price-summary {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
  text-align: right;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.price-item.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
  font-size: 16px;
  font-weight: bold;
}

.total-amount {
  color: #f56c6c;
  font-size: 18px;
}

.logistics-timeline {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.trace-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trace-status {
  font-weight: 500;
  color: #303133;
}

.trace-description {
  color: #606266;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 30px;
}

.text-gray-500 {
  color: #6b7280;
}

.text-sm {
  font-size: 0.875rem;
}

.text-red-500 {
  color: #f56c6c;
}

/* 打印样式 */
@media print {
  .page-header,
  .action-buttons {
    display: none;
  }

  .order-detail {
    padding: 0;
  }
}
</style>
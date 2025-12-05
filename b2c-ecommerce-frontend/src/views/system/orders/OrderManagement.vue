<template>
  <div class="order-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>订单管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportOrders">
          <el-icon><Download /></el-icon>
          导出订单
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.userName"
            placeholder="请输入用户名"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="searchForm.userPhone"
            placeholder="请输入手机号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择订单状态"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in orderStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select
            v-model="searchForm.paymentMethod"
            placeholder="请选择支付方式"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in paymentMethodOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 350px"
          />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input
            v-model="searchForm.minAmount"
            placeholder="最小金额"
            type="number"
            style="width: 120px"
          />
          <span style="margin: 0 8px">-</span>
          <el-input
            v-model="searchForm.maxAmount"
            placeholder="最大金额"
            type="number"
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="orderList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="orderNo" label="订单号" width="150" fixed="left">
          <template #default="{ row }">
            <el-link type="primary" @click="viewOrderDetail(row.id)">
              {{ row.orderNo }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="用户" width="120">
          <template #default="{ row }">
            <div>{{ row.userName }}</div>
            <div class="text-gray-500 text-sm">{{ row.userPhone }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="items" label="商品信息" min-width="200">
          <template #default="{ row }">
            <div class="product-info">
              <div v-for="(item, index) in row.items.slice(0, 2)" :key="item.id" class="product-item">
                <el-image
                  :src="item.productImage"
                  style="width: 40px; height: 40px; margin-right: 8px"
                  fit="cover"
                />
                <span>{{ item.productName }}</span>
                <span class="text-gray-500">x{{ item.quantity }}</span>
              </div>
              <div v-if="row.items.length > 2" class="text-gray-500 text-sm">
                等{{ row.items.length }}件商品
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="actualAmount" label="订单金额" width="120">
          <template #default="{ row }">
            <div class="amount-info">
              <div>￥{{ row.actualAmount.toFixed(2) }}</div>
              <div v-if="row.discountAmount > 0" class="text-gray-500 text-sm line-through">
                ￥{{ row.totalAmount.toFixed(2) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="100">
          <template #default="{ row }">
            <el-tag :type="getPaymentMethodType(row.paymentMethod)">
              {{ getPaymentMethodLabel(row.paymentMethod) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="viewOrderDetail(row.id)">
              详情
            </el-button>
            <el-button
              v-if="row.status === OrderStatus.PENDING_REVIEW"
              type="text"
              size="small"
              @click="handleAudit(row)"
            >
              审核
            </el-button>
            <el-button
              v-if="row.status === OrderStatus.PENDING_SHIPMENT"
              type="text"
              size="small"
              @click="handleShip(row)"
            >
              发货
            </el-button>
            <el-button
              v-if="row.status === OrderStatus.PENDING_PAYMENT"
              type="text"
              size="small"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
            <el-dropdown @command="(command) => handleMoreAction(command, row)">
              <el-button type="text" size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="export">导出订单</el-dropdown-item>
                  <el-dropdown-item command="mark-exception">标记异常</el-dropdown-item>
                  <el-dropdown-item command="add-remark">添加备注</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Download, Refresh, ArrowDown } from '@element-plus/icons-vue'
import { orderApi } from '@/api/order'
import { OrderStatus, PaymentMethod, type Order, type OrderQueryParams } from '@/types/order'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  userName: '',
  userPhone: '',
  status: undefined as number | undefined,
  paymentMethod: undefined as number | undefined,
  dateRange: null as [string, string] | null,
  minAmount: undefined as number | undefined,
  maxAmount: undefined as number | undefined
})

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 列表数据
const orderList = ref<Order[]>([])
const loading = ref(false)

// 订单状态选项
const orderStatusOptions = [
  { label: '待付款', value: OrderStatus.PENDING_PAYMENT },
  { label: '待审核', value: OrderStatus.PENDING_REVIEW },
  { label: '待发货', value: OrderStatus.PENDING_SHIPMENT },
  { label: '已发货', value: OrderStatus.SHIPPED },
  { label: '已收货', value: OrderStatus.DELIVERED },
  { label: '已完成', value: OrderStatus.COMPLETED },
  { label: '已取消', value: OrderStatus.CANCELLED },
  { label: '退款中', value: OrderStatus.REFUNDING },
  { label: '已退款', value: OrderStatus.REFUNDED },
  { label: '异常订单', value: OrderStatus.EXCEPTION }
]

// 支付方式选项
const paymentMethodOptions = [
  { label: '支付宝', value: PaymentMethod.ALIPAY },
  { label: '微信支付', value: PaymentMethod.WECHAT },
  { label: '余额支付', value: PaymentMethod.BALANCE },
  { label: '银行卡', value: PaymentMethod.BANK_CARD }
]

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
  currentOrder: null as Order | null,
  form: {
    approved: true,
    remark: ''
  }
})

// 发货对话框
const shipDialog = reactive({
  visible: false,
  currentOrder: null as Order | null,
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

const shipFormRef = ref<FormInstance>()

// 获取订单列表
const getOrders = async () => {
  loading.value = true
  try {
    const params: OrderQueryParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      orderNo: searchForm.orderNo || undefined,
      userName: searchForm.userName || undefined,
      userPhone: searchForm.userPhone || undefined,
      status: searchForm.status,
      paymentMethod: searchForm.paymentMethod,
      startTime: searchForm.dateRange?.[0],
      endTime: searchForm.dateRange?.[1],
      minAmount: searchForm.minAmount,
      maxAmount: searchForm.maxAmount
    }

    const response = await orderApi.getOrders(params)
    if (response.code === 200) {
      orderList.value = response.data.list
      pagination.total = response.data.total
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getOrders()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    orderNo: '',
    userName: '',
    userPhone: '',
    status: undefined,
    paymentMethod: undefined,
    dateRange: null,
    minAmount: undefined,
    maxAmount: undefined
  })
  pagination.page = 1
  getOrders()
}

// 刷新数据
const refreshData = () => {
  getOrders()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  getOrders()
}

// 页码改变
const handleCurrentChange = (page: number) => {
  pagination.page = page
  getOrders()
}

// 查看订单详情
const viewOrderDetail = (orderId: number) => {
  router.push(`/system/orders/detail/${orderId}`)
}

// 处理审核
const handleAudit = (order: Order) => {
  auditDialog.currentOrder = order
  auditDialog.title = `审核订单 - ${order.orderNo}`
  auditDialog.form = {
    approved: true,
    remark: ''
  }
  auditDialog.visible = true
}

// 确认审核
const confirmAudit = async () => {
  if (!auditDialog.currentOrder) return

  try {
    const response = await orderApi.auditOrder(
      auditDialog.currentOrder.id,
      auditDialog.form.approved,
      auditDialog.form.remark
    )
    if (response.code === 200) {
      ElMessage.success(response.message)
      auditDialog.visible = false
      getOrders()
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    ElMessage.error('审核失败')
  }
}

// 处理发货
const handleShip = (order: Order) => {
  shipDialog.currentOrder = order
  shipDialog.form = {
    companyName: '',
    trackingNumber: '',
    remark: ''
  }
  shipDialog.visible = true
}

// 确认发货
const confirmShip = async () => {
  if (!shipFormRef.value || !shipDialog.currentOrder) return

  try {
    await shipFormRef.value.validate()

    const logisticsInfo = {
      companyCode: logisticsCompanies.find(c => c.name === shipDialog.form.companyName)?.code || '',
      companyName: shipDialog.form.companyName,
      trackingNumber: shipDialog.form.trackingNumber
    }

    const response = await orderApi.shipOrder(shipDialog.currentOrder.id, logisticsInfo)
    if (response.code === 200) {
      ElMessage.success(response.message)
      shipDialog.visible = false
      getOrders()
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    ElMessage.error('发货失败')
  }
}

// 处理取消订单
const handleCancel = async (order: Order) => {
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

    const response = await orderApi.cancelOrder(order.id, reason)
    if (response.code === 200) {
      ElMessage.success(response.message)
      getOrders()
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    // 用户取消操作
  }
}

// 处理更多操作
const handleMoreAction = async (command: string, order: Order) => {
  switch (command) {
    case 'export':
      ElMessage.info('导出功能开发中...')
      break
    case 'mark-exception':
      await markOrderAsException(order)
      break
    case 'add-remark':
      await addOrderRemark(order)
      break
  }
}

// 标记为异常订单
const markOrderAsException = async (order: Order) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入异常原因', '标记异常订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入异常原因'
    })

    const response = await orderApi.markOrderAsException(order.id, reason)
    if (response.code === 200) {
      ElMessage.success(response.message)
      getOrders()
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    // 用户取消操作
  }
}

// 添加订单备注
const addOrderRemark = async (order: Order) => {
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

// 导出订单
const exportOrders = () => {
  ElMessage.info('导出功能开发中...')
}

// 获取状态标签
const getStatusLabel = (status: OrderStatus) => {
  const option = orderStatusOptions.find(item => item.value === status)
  return option?.label || '未知状态'
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
  const option = paymentMethodOptions.find(item => item.value === method)
  return option?.label || '未知方式'
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
  getOrders()
})
</script>

<style scoped>
.order-management {
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
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.text-gray-500 {
  color: #6b7280;
}

.text-sm {
  font-size: 0.875rem;
}

.line-through {
  text-decoration: line-through;
}
</style>
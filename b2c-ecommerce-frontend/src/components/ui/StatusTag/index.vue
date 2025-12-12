<template>
  <el-tag :type="tagType" :effect="effect" :size="size">
    <el-icon v-if="icon" class="mr-1">
      <component :is="icon" />
    </el-icon>
    {{ displayText }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  InfoFilled,
  Clock,
  Loading,
  Check,
  Close,
  Remove,
  ShoppingBag,
  Van,
  Box,
  User
} from '@element-plus/icons-vue'

// 定义通用状态类型
export enum CommonStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  DISABLED = 'disabled'
}

// 定义订单状态类型
export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PENDING_SHIPMENT = 'pending_shipment',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
  EXCEPTION = 'exception'
}

// 定义支付状态类型
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// 定义库存状态类型
export enum StockStatus {
  NORMAL = 'normal',
  LOW = 'low',
  OUT = 'out',
  LOCKED = 'locked'
}

// 定义退款状态类型
export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

const props = defineProps({
  // 状态值
  status: {
    type: [String, Number],
    required: true
  },

  // 状态类型
  statusType: {
    type: String as () => 'common' | 'order' | 'payment' | 'stock' | 'refund' | 'custom',
    default: 'common'
  },

  // 自定义状态映射
  statusMap: {
    type: Object as () => Record<string | number, { text: string; type: string; icon?: any }>,
    default: () => ({})
  },

  // Tag 属性
  effect: {
    type: String as () => 'dark' | 'light' | 'plain',
    default: 'light'
  },
  size: {
    type: String as () => 'large' | 'default' | 'small',
    default: 'default'
  }
})

// 默认的状态映射配置
const defaultStatusMaps = {
  // 通用状态
  common: {
    [CommonStatus.ACTIVE]: { text: '启用', type: 'success' },
    [CommonStatus.INACTIVE]: { text: '禁用', type: 'info' },
    [CommonStatus.PENDING]: { text: '待处理', type: 'warning', icon: Clock },
    [CommonStatus.SUCCESS]: { text: '成功', type: 'success', icon: Check },
    [CommonStatus.FAILED]: { text: '失败', type: 'danger', icon: Close },
    [CommonStatus.DISABLED]: { text: '已禁用', type: 'danger' }
  },

  // 订单状态
  order: {
    [OrderStatus.PENDING_PAYMENT]: { text: '待支付', type: 'warning', icon: Clock },
    [OrderStatus.PAID]: { text: '已支付', type: 'success', icon: Check },
    [OrderStatus.PENDING_REVIEW]: { text: '待审核', type: 'warning', icon: Clock },
    [OrderStatus.APPROVED]: { text: '已审核', type: 'success', icon: Check },
    [OrderStatus.REJECTED]: { text: '已拒绝', type: 'danger', icon: Close },
    [OrderStatus.PENDING_SHIPMENT]: { text: '待发货', type: 'primary', icon: Box },
    [OrderStatus.SHIPPED]: { text: '已发货', type: 'primary', icon: Van },
    [OrderStatus.DELIVERED]: { text: '已送达', type: 'success', icon: Box },
    [OrderStatus.COMPLETED]: { text: '已完成', type: 'success', icon: Check },
    [OrderStatus.CANCELLED]: { text: '已取消', type: 'info', icon: Remove },
    [OrderStatus.REFUNDING]: { text: '退款中', type: 'warning', icon: Loading },
    [OrderStatus.REFUNDED]: { text: '已退款', type: 'info', icon: Check },
    [OrderStatus.EXCEPTION]: { text: '异常', type: 'danger', icon: WarningFilled }
  },

  // 支付状态
  payment: {
    [PaymentStatus.PENDING]: { text: '待支付', type: 'warning', icon: Clock },
    [PaymentStatus.PROCESSING]: { text: '处理中', type: 'primary', icon: Loading },
    [PaymentStatus.SUCCESS]: { text: '支付成功', type: 'success', icon: Check },
    [PaymentStatus.FAILED]: { text: '支付失败', type: 'danger', icon: Close },
    [PaymentStatus.CANCELLED]: { text: '已取消', type: 'info', icon: Remove },
    [PaymentStatus.REFUNDED]: { text: '已退款', type: 'info', icon: Check }
  },

  // 库存状态
  stock: {
    [StockStatus.NORMAL]: { text: '正常', type: 'success' },
    [StockStatus.LOW]: { text: '库存不足', type: 'warning', icon: WarningFilled },
    [StockStatus.OUT]: { text: '已售罄', type: 'danger', icon: CircleCloseFilled },
    [StockStatus.LOCKED]: { text: '已锁定', type: 'info' }
  },

  // 退款状态
  refund: {
    [RefundStatus.PENDING]: { text: '待处理', type: 'warning', icon: Clock },
    [RefundStatus.PROCESSING]: { text: '处理中', type: 'primary', icon: Loading },
    [RefundStatus.SUCCESS]: { text: '退款成功', type: 'success', icon: Check },
    [RefundStatus.FAILED]: { text: '退款失败', type: 'danger', icon: Close },
    [RefundStatus.CANCELLED]: { text: '已取消', type: 'info', icon: Remove }
  }
}

// 计算显示文本和类型
const displayConfig = computed(() => {
  // 如果有自定义映射，优先使用
  if (props.statusMap && props.statusMap[props.status]) {
    return props.statusMap[props.status]
  }

  // 使用默认映射
  const map = defaultStatusMaps[props.statusType as keyof typeof defaultStatusMaps]
  return map?.[props.status] || { text: props.status, type: 'info' }
})

const displayText = computed(() => displayConfig.value.text)
const tagType = computed(() => displayConfig.value.type)
const icon = computed(() => displayConfig.value.icon)
</script>

<style lang="scss" scoped>
// 组件样式继承自 Element Plus 的 el-tag
</style>
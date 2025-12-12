// 统一的退款类型定义

export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum RefundType {
  FULL = 'full',
  PARTIAL = 'partial'
}

export enum RefundMethod {
  ORIGINAL = 'original',  // 原路退回
  MANUAL = 'manual',     // 手动退款
  BALANCE = 'balance'    // 退回余额
}

// 退款申请基础信息
export interface RefundApplication {
  id: string
  orderId: string
  orderNo: string
  paymentId: string
  originalAmount: number
  refundAmount: number
  refundReason: string
  refundType: RefundType
  refundMethod: RefundMethod
  status: RefundStatus
  applyUserId: string
  applyUserName: string
  applyTime: string
  proofImages: string[]  // 退款凭证图片
  items: RefundItem[]   // 退款商品明细
}

// 退款商品明细
export interface RefundItem {
  orderItemId: string
  productId: string
  productName: string
  skuId: string
  skuName: string
  skuImage: string
  unitPrice: number
  quantity: number
  refundAmount: number
  refundReason: string
}

// 退款处理信息
export interface RefundProcess {
  processorId?: string
  processorName?: string
  processTime?: string
  approveStatus?: 'approved' | 'rejected'
  processNote?: string
  failureReason?: string
  refundProof?: string  // 退款凭证
  trackingInfo?: {
    companyCode: string
    companyName: string
    trackingNumber: string
  }
}

// 完整的退款记录
export interface RefundRecord extends RefundApplication {
  // 处理信息
  processedAt?: string
  processorId?: string
  processorName?: string
  processNote?: string

  // 财务信息
  actualRefundAmount?: number
  refundFee?: number
  refundAccount?: string

  // 物流信息（仅退货退款）
  returnAddress?: ReturnAddress
  returnLogistics?: LogisticsInfo

  // 审核流程
  auditFlow: AuditFlow[]

  // 时间记录
  createdAt: string
  updatedAt: string
}

// 退货地址
export interface ReturnAddress {
  name: string
  phone: string
  address: string
  province: string
  city: string
  district: string
  zipCode?: string
}

// 物流信息
export interface LogisticsInfo {
  companyCode: string
  companyName: string
  trackingNumber: string
  shippedAt?: string
  deliveredAt?: string
  status: 'pending' | 'shipped' | 'delivered' | 'exception'
}

// 审核流程
export interface AuditFlow {
  step: number
  stepName: string
  auditorId?: string
  auditorName?: string
  status: 'pending' | 'approved' | 'rejected'
  auditTime?: string
  comment?: string
}

// 退款查询参数
export interface RefundQueryParams {
  page?: number
  size?: number
  status?: RefundStatus
  refundType?: RefundType
  refundMethod?: RefundMethod
  orderId?: string
  orderNo?: string
  applyUserId?: string
  applyUserName?: string
  startTime?: string
  endTime?: string
  minAmount?: number
  maxAmount?: number
}

// 退款统计
export interface RefundStatistics {
  totalCount: number
  totalAmount: number
  pendingCount: number
  pendingAmount: number
  processingCount: number
  processingAmount: number
  successCount: number
  successAmount: number
  failedCount: number
  failedAmount: number
  refundRate: number  // 退款率
  avgRefundAmount: number
  monthlyStats: MonthlyRefundStat[]
}

// 月度退款统计
export interface MonthlyRefundStat {
  month: string
  count: number
  amount: number
  rate: number
}
// 订单相关类型定义

// 订单状态枚举
export enum OrderStatus {
  PENDING_PAYMENT = 1,      // 待付款
  PENDING_REVIEW = 2,       // 待审核
  PENDING_SHIPMENT = 3,     // 待发货
  SHIPPED = 4,              // 已发货
  DELIVERED = 5,            // 已收货
  COMPLETED = 6,            // 已完成
  CANCELLED = 7,            // 已取消
  REFUNDING = 8,            // 退款中
  REFUNDED = 9,             // 已退款
  EXCEPTION = 10            // 异常订单
}

// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = 1,               // 支付宝
  WECHAT = 2,               // 微信支付
  BALANCE = 3,              // 余额支付
  BANK_CARD = 4             // 银行卡
}

// 退款状态枚举
export enum RefundStatus {
  PENDING = 1,              // 待处理
  APPROVED = 2,             // 已同意
  REJECTED = 3,             // 已拒绝
  PROCESSING = 4,           // 处理中
  COMPLETED = 5             // 已完成
}

// 售后类型枚举
export enum AfterSaleType {
  REFUND = 1,               // 仅退款
  RETURN = 2,               // 退货退款
  EXCHANGE = 3              // 换货
}

// 订单商品项
export interface OrderItem {
  id: number
  orderId: number
  productId: number
  productName: string
  productImage: string
  skuId: number
  skuName: string
  skuPrice: number
  quantity: number
  totalPrice: number
}

// 收货地址信息
export interface Address {
  id: number
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  address: string
  zipCode?: string
  isDefault: boolean
}

// 物流信息
export interface Logistics {
  id: number
  orderId: number
  companyCode: string
  companyName: string
  trackingNumber: string
  status: number
  lastUpdate: string
  traces: LogisticsTrace[]
}

// 物流轨迹
export interface LogisticsTrace {
  time: string
  status: string
  description: string
}

// 订单主表
export interface Order {
  id: number
  orderNo: string
  userId: number
  userName: string
  userPhone: string
  totalAmount: number
  discountAmount: number
  shippingFee: number
  actualAmount: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentTime?: string
  paymentNo?: string
  address: Address
  items: OrderItem[]
  remark?: string
  createTime: string
  updateTime: string
  payTime?: string
  shipTime?: string
  receiveTime?: string
  completeTime?: string
  cancelTime?: string
  logistics?: Logistics
}

// 退款信息
export interface Refund {
  id: number
  orderId: number
  orderNo: string
  userId: number
  userName: string
  refundAmount: number
  reason: string
  description: string
  status: RefundStatus
  applyTime: string
  processTime?: string
  completeTime?: string
  processor?: string
  remark?: string
}

// 售后服务信息
export interface AfterSale {
  id: number
  orderId: number
  orderNo: string
  userId: number
  userName: string
  type: AfterSaleType
  reason: string
  description: string
  images?: string[]
  status: RefundStatus
  applyTime: string
  processTime?: string
  completeTime?: string
  processor?: string
  refundAmount?: number
  remark?: string
}

// 订单查询参数
export interface OrderQueryParams {
  page?: number
  pageSize?: number
  orderNo?: string
  userId?: number
  userName?: string
  userPhone?: string
  status?: OrderStatus
  paymentMethod?: PaymentMethod
  startTime?: string
  endTime?: string
  minAmount?: number
  maxAmount?: number
}

// 订单统计数据
export interface OrderStatistics {
  totalOrders: number
  todayOrders: number
  todayAmount: number
  pendingPaymentCount: number
  pendingShipmentCount: number
  exceptionCount: number
  refundingCount: number
  statusDistribution: {
    status: OrderStatus
    count: number
    amount: number
  }[]
  paymentMethodDistribution: {
    method: PaymentMethod
    count: number
    amount: number
  }[]
  dailyTrend: {
    date: string
    orderCount: number
    amount: number
  }[]
}

// API响应类型
export interface OrderApiResponse<T> {
  code: number
  message: string
  data: T
}
// 支付渠道类型
export interface PaymentChannel {
  id: string
  name: string
  type: 'alipay' | 'wechat' | 'unionpay' | 'paypal' | 'stripe'
  status: 'active' | 'inactive' | 'disabled'
  icon: string
  config: PaymentChannelConfig
  createdAt: string
  updatedAt: string
  description?: string
  sort: number
}

// 支付渠道配置
export interface PaymentChannelConfig {
  appId: string
  appSecret: string
  merchantId: string
  publicKey?: string
  privateKey?: string
  notifyUrl: string
  returnUrl: string
  environment: 'sandbox' | 'production'
  feeRate: number
  minAmount: number
  maxAmount: number
  supportedCurrencies: string[]
}

// 支付记录
export interface PaymentRecord {
  id: string
  orderId: string
  paymentChannelId: string
  paymentChannel: string
  paymentMethod: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded'
  transactionId?: string
  thirdPartyTransactionId?: string
  paymentTime?: string
  failureReason?: string
  refundAmount?: number
  refundTime?: string
  createdAt: string
  updatedAt: string
  clientInfo: {
    ip: string
    userAgent: string
    device: string
  }
  riskLevel: 'low' | 'medium' | 'high'
  riskScore: number
}

// 支付安全规则
export interface PaymentSecurityRule {
  id: string
  name: string
  type: 'amount_limit' | 'frequency_limit' | 'ip_whitelist' | 'ip_blacklist' | 'risk_score' | 'custom'
  status: 'active' | 'inactive'
  conditions: SecurityRuleCondition[]
  actions: SecurityRuleAction[]
  priority: number
  createdAt: string
  updatedAt: string
  description?: string
}

// 安全规则条件
export interface SecurityRuleCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains'
  value: any
  logicalOperator?: 'and' | 'or'
}

// 安全规则动作
export interface SecurityRuleAction {
  type: 'block' | 'manual_review' | 'additional_verification' | 'alert' | 'log'
  parameters?: Record<string, any>
}

// 退款记录
export interface RefundRecord {
  id: string
  orderId: string
  paymentId: string
  originalAmount: number
  refundAmount: number
  refundReason: string
  refundType: 'full' | 'partial'
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled'
  refundMethod: 'original' | 'manual'
  processorId?: string
  processorName?: string
  processedAt?: string
  failureReason?: string
  refundProof?: string
  createdAt: string
  updatedAt: string
  applyUserId: string
  applyUserName: string
}

// 对账记录
export interface ReconciliationRecord {
  id: string
  date: string
  paymentChannel: string
  totalCount: number
  totalAmount: number
  successCount: number
  successAmount: number
  failedCount: number
  failedAmount: number
  refundCount: number
  refundAmount: number
  feeAmount: number
  actualAmount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  reportPath?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
  processedBy?: string
}

// 对账差异
export interface ReconciliationDifference {
  id: string
  reconciliationId: string
  type: 'missing' | 'amount_mismatch' | 'status_mismatch' | 'duplicate'
  orderId: string
  paymentId: string
  systemAmount?: number
  channelAmount?: number
  differenceAmount?: number
  description: string
  status: 'pending' | 'resolved' | 'ignored'
  resolvedAt?: string
  resolvedBy?: string
  resolveNote?: string
  createdAt: string
}

// 支付统计
export interface PaymentStatistics {
  date: string
  totalCount: number
  totalAmount: number
  successCount: number
  successAmount: number
  failedCount: number
  failedAmount: number
  refundCount: number
  refundAmount: number
  channelStats: ChannelStatistics[]
  methodStats: MethodStatistics[]
  hourlyStats: HourlyStatistics[]
  riskStats: RiskStatistics
}

// 渠道统计
export interface ChannelStatistics {
  channel: string
  count: number
  amount: number
  successRate: number
  averageAmount: number
}

// 支付方式统计
export interface MethodStatistics {
  method: string
  count: number
  amount: number
  successRate: number
  averageAmount: number
}

// 小时统计
export interface HourlyStatistics {
  hour: number
  count: number
  amount: number
}

// 风险统计
export interface RiskStatistics {
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  blockedCount: number
  manualReviewCount: number
}

// 支付配置
export interface PaymentConfig {
  autoReconciliation: boolean
  reconciliationTime: string
  riskControlEnabled: boolean
  alertEnabled: boolean
  alertEmails: string[]
  supportedCurrencies: string[]
  defaultCurrency: string
  exchangeRateProvider: string
  settlementCycle: 'T1' | 'T2' | 'T3' | 'T7'
  minimumAmount: number
  maximumAmount: number
  idempotencyEnabled: boolean
  webhookRetryCount: number
  paymentTimeout: number
}

// API 请求和响应类型
export interface PaymentChannelListParams {
  page?: number
  pageSize?: number
  type?: string
  status?: string
  keyword?: string
}

export interface PaymentRecordListParams {
  page?: number
  pageSize?: number
  paymentChannelId?: string
  status?: string
  startTime?: string
  endTime?: string
  orderId?: string
  transactionId?: string
  minAmount?: number
  maxAmount?: number
  riskLevel?: string
}

export interface RefundRecordListParams {
  page?: number
  pageSize?: number
  orderId?: string
  paymentId?: string
  status?: string
  refundType?: string
  startTime?: string
  endTime?: string
  minAmount?: number
  maxAmount?: number
  applyUserId?: string
}

export interface ReconciliationListParams {
  page?: number
  pageSize?: number
  date?: string
  paymentChannel?: string
  status?: string
  startTime?: string
  endTime?: string
}

export interface PaymentStatisticsParams {
  startDate?: string
  endDate?: string
  paymentChannel?: string
  groupBy?: 'day' | 'week' | 'month'
}

// API响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}


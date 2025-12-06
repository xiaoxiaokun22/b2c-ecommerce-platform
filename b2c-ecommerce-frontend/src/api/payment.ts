import request from './request'

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

// API 请求和响应参数类型
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

// 支付渠道管理API
export const paymentChannelApi = {
  // 获取支付渠道列表
  getList: (params: PaymentChannelListParams) => {
    return request.get<ApiResponse<PaginatedResponse<PaymentChannel>>>('/payment/channels', { params })
  },

  // 获取支付渠道详情
  getDetail: (id: string) => {
    return request.get<ApiResponse<PaymentChannel>>(`/payment/channels/${id}`)
  },

  // 创建支付渠道
  create: (data: Omit<PaymentChannel, 'id' | 'createdAt' | 'updatedAt'>) => {
    return request.post<ApiResponse<PaymentChannel>>('/payment/channels', data)
  },

  // 更新支付渠道
  update: (id: string, data: Partial<PaymentChannel>) => {
    return request.put<ApiResponse<PaymentChannel>>(`/payment/channels/${id}`, data)
  },

  // 删除支付渠道
  delete: (id: string) => {
    return request.delete<ApiResponse<void>>(`/payment/channels/${id}`)
  },

  // 启用/禁用支付渠道
  updateStatus: (id: string, status: 'active' | 'inactive' | 'disabled') => {
    return request.patch<ApiResponse<void>>(`/payment/channels/${id}/status`, { status })
  },

  // 测试支付渠道配置
  testConfig: (id: string) => {
    return request.post<ApiResponse<{ success: boolean; message: string }>>(`/payment/channels/${id}/test`)
  }
}

// 支付记录管理API
export const paymentRecordApi = {
  // 获取支付记录列表
  getList: (params: PaymentRecordListParams) => {
    return request.get<ApiResponse<PaginatedResponse<PaymentRecord>>>('/payment/records', { params })
  },

  // 获取支付记录详情
  getDetail: (id: string) => {
    return request.get<ApiResponse<PaymentRecord>>(`/payment/records/${id}`)
  },

  // 重试支付
  retry: (id: string) => {
    return request.post<ApiResponse<PaymentRecord>>(`/payment/records/${id}/retry`)
  },

  // 取消支付
  cancel: (id: string, reason: string) => {
    return request.post<ApiResponse<void>>(`/payment/records/${id}/cancel`, { reason })
  },

  // 获取支付统计
  getStatistics: (params: PaymentStatisticsParams) => {
    return request.get<ApiResponse<PaymentStatistics>>('/payment/records/statistics', { params })
  }
}

// 支付安全管理API
export const paymentSecurityApi = {
  // 获取安全规则列表
  getRules: () => {
    return request.get<ApiResponse<PaymentSecurityRule[]>>('/payment/security/rules')
  },

  // 获取安全规则详情
  getRuleDetail: (id: string) => {
    return request.get<ApiResponse<PaymentSecurityRule>>(`/payment/security/rules/${id}`)
  },

  // 创建安全规则
  createRule: (data: Omit<PaymentSecurityRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    return request.post<ApiResponse<PaymentSecurityRule>>('/payment/security/rules', data)
  },

  // 更新安全规则
  updateRule: (id: string, data: Partial<PaymentSecurityRule>) => {
    return request.put<ApiResponse<PaymentSecurityRule>>(`/payment/security/rules/${id}`, data)
  },

  // 删除安全规则
  deleteRule: (id: string) => {
    return request.delete<ApiResponse<void>>(`/payment/security/rules/${id}`)
  },

  // 启用/禁用安全规则
  updateRuleStatus: (id: string, status: 'active' | 'inactive') => {
    return request.patch<ApiResponse<void>>(`/payment/security/rules/${id}/status`, { status })
  },

  // 获取风险事件列表
  getRiskEvents: (params: { page?: number; pageSize?: number; riskLevel?: string; startTime?: string; endTime?: string }) => {
    return request.get<ApiResponse<PaginatedResponse<any>>>('/payment/security/risk-events', { params })
  }
}

// 退款管理API
export const refundApi = {
  // 获取退款记录列表
  getList: (params: RefundRecordListParams) => {
    return request.get<ApiResponse<PaginatedResponse<RefundRecord>>>('/payment/refunds', { params })
  },

  // 获取退款记录详情
  getDetail: (id: string) => {
    return request.get<ApiResponse<RefundRecord>>(`/payment/refunds/${id}`)
  },

  // 创建退款
  create: (data: {
    orderId: string
    paymentId: string
    refundAmount: number
    refundReason: string
    refundType: 'full' | 'partial'
  }) => {
    return request.post<ApiResponse<RefundRecord>>('/payment/refunds', data)
  },

  // 处理退款
  process: (id: string, approved: boolean, processorNote?: string) => {
    return request.post<ApiResponse<RefundRecord>>(`/payment/refunds/${id}/process`, { approved, processorNote })
  },

  // 取消退款
  cancel: (id: string, reason: string) => {
    return request.post<ApiResponse<void>>(`/payment/refunds/${id}/cancel`, { reason })
  },

  // 导入退款证明
  uploadProof: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<ApiResponse<string>>(`/payment/refunds/${id}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// 对账管理API
export const reconciliationApi = {
  // 获取对账记录列表
  getList: (params: ReconciliationListParams) => {
    return request.get<ApiResponse<PaginatedResponse<ReconciliationRecord>>>('/payment/reconciliations', { params })
  },

  // 获取对账记录详情
  getDetail: (id: string) => {
    return request.get<ApiResponse<ReconciliationRecord>>(`/payment/reconciliations/${id}`)
  },

  // 手动触发对账
  trigger: (data: { date: string; paymentChannel?: string }) => {
    return request.post<ApiResponse<ReconciliationRecord>>('/payment/reconciliations/trigger', data)
  },

  // 下载对账报告
  downloadReport: (id: string) => {
    return request.get(`/payment/reconciliations/${id}/download`, { responseType: 'blob' })
  },

  // 获取对账差异列表
  getDifferences: (reconciliationId: string) => {
    return request.get<ApiResponse<ReconciliationDifference[]>>(`/payment/reconciliations/${reconciliationId}/differences`)
  },

  // 解决对账差异
  resolveDifference: (id: string, resolution: 'resolved' | 'ignored', note?: string) => {
    return request.post<ApiResponse<void>>(`/payment/reconciliations/differences/${id}/resolve`, { resolution, note })
  }
}

// 支付配置API
export const paymentConfigApi = {
  // 获取支付配置
  getConfig: () => {
    return request.get<ApiResponse<PaymentConfig>>('/payment/config')
  },

  // 更新支付配置
  updateConfig: (data: Partial<PaymentConfig>) => {
    return request.put<ApiResponse<PaymentConfig>>('/payment/config', data)
  },

  // 获取支持的支付渠道类型
  getSupportedChannelTypes: () => {
    return request.get<ApiResponse<{ type: string; name: string; description: string }[]>>('/payment/config/channel-types')
  },

  // 获取支持的货币列表
  getSupportedCurrencies: () => {
    return request.get<ApiResponse<{ code: string; name: string; symbol: string }[]>>('/payment/config/currencies')
  }
}

// 支付统计分析API
export const paymentStatisticsApi = {
  // 获取概览统计
  getOverview: (params: { startDate?: string; endDate?: string }) => {
    return request.get<ApiResponse<{
      totalAmount: number
      totalCount: number
      successRate: number
      refundRate: number
      averageAmount: number
      channelStats: PaymentStatistics['channelStats']
      methodStats: PaymentStatistics['methodStats']
      trendData: PaymentStatistics[]
    }>>('/payment/statistics/overview', { params })
  },

  // 获取趋势分析
  getTrendAnalysis: (params: PaymentStatisticsParams & { metric: 'amount' | 'count' | 'success_rate' }) => {
    return request.get<ApiResponse<{ date: string; value: number }[]>>('/payment/statistics/trend', { params })
  },

  // 获取渠道分析
  getChannelAnalysis: (params: { startDate?: string; endDate?: string; channel?: string }) => {
    return request.get<ApiResponse<{
      channel: string
      totalAmount: number
      totalCount: number
      successRate: number
      averageAmount: number
      trendData: { date: string; value: number }[]
    }[]>>('/payment/statistics/channels', { params })
  },

  // 获取风险分析
  getRiskAnalysis: (params: { startDate?: string; endDate?: string }) => {
    return request.get<ApiResponse<{
      riskDistribution: PaymentStatistics['riskStats']
      riskEvents: { date: string; count: number; blockedCount: number }[]
      riskTrends: { date: string; riskScore: number }[]
    }>>('/payment/statistics/risk', { params })
  },

  // 导出统计报告
  exportReport: (params: PaymentStatisticsParams & { format: 'excel' | 'pdf' }) => {
    return request.get('/payment/statistics/export', { params, responseType: 'blob' })
  }
}
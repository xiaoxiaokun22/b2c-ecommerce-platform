import request from './request'
// Payment API module - Updated to fix import issues
import {
  PaymentChannel,
  PaymentRecord,
  PaymentSecurityRule,
  RefundRecord,
  ReconciliationRecord,
  ReconciliationDifference,
  PaymentStatistics,
  PaymentConfig,
  PaymentChannelListParams,
  PaymentRecordListParams,
  RefundRecordListParams,
  ReconciliationListParams,
  PaymentStatisticsParams
} from '@/types/payment'

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
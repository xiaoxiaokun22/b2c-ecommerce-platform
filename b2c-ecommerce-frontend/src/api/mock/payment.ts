import type {
  PaymentChannel,
  PaymentRecord,
  PaymentSecurityRule,
  RefundRecord,
  ReconciliationRecord,
  ReconciliationDifference,
  PaymentStatistics,
  PaymentConfig
} from '@/types/payment'

// 支付渠道Mock数据
export const mockPaymentChannels: PaymentChannel[] = [
  {
    id: '1',
    name: '支付宝',
    type: 'alipay',
    status: 'active',
    icon: 'https://example.com/icons/alipay.png',
    config: {
      appId: '2021000000000000',
      appSecret: 'your_app_secret',
      merchantId: '2088000000000000',
      publicKey: 'your_public_key',
      privateKey: 'your_private_key',
      notifyUrl: 'https://example.com/payment/notify/alipay',
      returnUrl: 'https://example.com/payment/return/alipay',
      environment: 'production',
      feeRate: 0.006,
      minAmount: 0.01,
      maxAmount: 50000,
      supportedCurrencies: ['CNY']
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    description: '支付宝扫码支付和手机支付',
    sort: 1
  },
  {
    id: '2',
    name: '微信支付',
    type: 'wechat',
    status: 'active',
    icon: 'https://example.com/icons/wechat.png',
    config: {
      appId: 'wx0000000000000000',
      appSecret: 'your_app_secret',
      merchantId: '1234567890',
      publicKey: 'your_public_key',
      privateKey: 'your_private_key',
      notifyUrl: 'https://example.com/payment/notify/wechat',
      returnUrl: 'https://example.com/payment/return/wechat',
      environment: 'production',
      feeRate: 0.006,
      minAmount: 0.01,
      maxAmount: 50000,
      supportedCurrencies: ['CNY']
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    description: '微信扫码支付和小程序支付',
    sort: 2
  },
  {
    id: '3',
    name: '银联支付',
    type: 'unionpay',
    status: 'inactive',
    icon: 'https://example.com/icons/unionpay.png',
    config: {
      appId: 'unionpay_app_id',
      appSecret: 'your_app_secret',
      merchantId: '777290000000000',
      notifyUrl: 'https://example.com/payment/notify/unionpay',
      returnUrl: 'https://example.com/payment/return/unionpay',
      environment: 'sandbox',
      feeRate: 0.0055,
      minAmount: 0.01,
      maxAmount: 100000,
      supportedCurrencies: ['CNY']
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    description: '银联卡支付',
    sort: 3
  }
]

// 支付记录Mock数据
export const mockPaymentRecords: PaymentRecord[] = Array.from({ length: 50 }, (_, index) => ({
  id: `payment_${index + 1}`,
  orderId: `order_${Math.floor(index / 3) + 1}`,
  paymentChannelId: `${(index % 3) + 1}`,
  paymentChannel: ['支付宝', '微信支付', '银联支付'][index % 3],
  paymentMethod: ['扫码支付', '手机支付', '网页支付'][index % 3],
  amount: Math.floor(Math.random() * 10000) + 100,
  currency: 'CNY',
  status: ['success', 'failed', 'pending', 'refunded'][index % 4] as any,
  transactionId: `txn_${Date.now()}_${index}`,
  thirdPartyTransactionId: `third_${Date.now()}_${index}`,
  paymentTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  failureReason: index % 4 === 1 ? '余额不足' : undefined,
  refundAmount: index % 4 === 3 ? Math.floor(Math.random() * 5000) + 100 : undefined,
  refundTime: index % 4 === 3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  clientInfo: {
    ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    device: ['PC', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)]
  },
  riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
  riskScore: Math.floor(Math.random() * 100)
}))

// 支付安全规则Mock数据
export const mockPaymentSecurityRules: PaymentSecurityRule[] = [
  {
    id: '1',
    name: '单笔支付金额限制',
    type: 'amount_limit',
    status: 'active',
    conditions: [
      {
        field: 'amount',
        operator: 'gt',
        value: 50000,
        logicalOperator: 'and'
      }
    ],
    actions: [
      {
        type: 'manual_review',
        parameters: { reason: '高额支付需要人工审核' }
      }
    ],
    priority: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    description: '单笔支付金额超过50000元时需要人工审核'
  },
  {
    id: '2',
    name: '高频支付限制',
    type: 'frequency_limit',
    status: 'active',
    conditions: [
      {
        field: 'payment_count_1h',
        operator: 'gt',
        value: 10,
        logicalOperator: 'and'
      }
    ],
    actions: [
      {
        type: 'block',
        parameters: { reason: '1小时内支付次数过多' }
      }
    ],
    priority: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    description: '1小时内支付次数超过10次时拦截'
  },
  {
    id: '3',
    name: 'IP黑名单',
    type: 'ip_blacklist',
    status: 'active',
    conditions: [
      {
        field: 'client_ip',
        operator: 'in',
        value: ['192.168.1.100', '10.0.0.50'],
        logicalOperator: 'or'
      }
    ],
    actions: [
      {
        type: 'block',
        parameters: { reason: 'IP在黑名单中' }
      }
    ],
    priority: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    description: '拦截黑名单IP的支付请求'
  }
]

// 退款记录Mock数据
export const mockRefundRecords: RefundRecord[] = Array.from({ length: 30 }, (_, index) => ({
  id: `refund_${index + 1}`,
  orderId: `order_${Math.floor(index / 2) + 1}`,
  paymentId: `payment_${index + 1}`,
  originalAmount: Math.floor(Math.random() * 10000) + 100,
  refundAmount: Math.floor(Math.random() * 5000) + 100,
  refundReason: ['商品质量问题', '发货延迟', '用户取消订单', '价格错误'][Math.floor(Math.random() * 4)],
  refundType: Math.random() > 0.5 ? 'full' : 'partial',
  status: ['pending', 'processing', 'success', 'failed'][Math.floor(Math.random() * 4)] as any,
  refundMethod: 'original',
  processorId: `processor_${Math.floor(Math.random() * 5) + 1}`,
  processorName: ['张三', '李四', '王五', '赵六', '钱七'][Math.floor(Math.random() * 5)],
  processedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  failureReason: Math.floor(Math.random() * 4) === 3 ? '第三方退款失败' : undefined,
  refundProof: Math.random() > 0.5 ? `refund_proof_${index + 1}.pdf` : undefined,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  applyUserId: `user_${Math.floor(Math.random() * 10) + 1}`,
  applyUserName: ['用户A', '用户B', '用户C', '用户D', '用户E'][Math.floor(Math.random() * 5)]
}))

// 对账记录Mock数据
export const mockReconciliationRecords: ReconciliationRecord[] = Array.from({ length: 20 }, (_, index) => {
  const date = new Date()
  date.setDate(date.getDate() - index)

  return {
    id: `reconciliation_${index + 1}`,
    date: date.toISOString().split('T')[0],
    paymentChannel: ['支付宝', '微信支付', '银联支付'][index % 3],
    totalCount: Math.floor(Math.random() * 1000) + 100,
    totalAmount: Math.floor(Math.random() * 1000000) + 10000,
    successCount: Math.floor(Math.random() * 900) + 50,
    successAmount: Math.floor(Math.random() * 900000) + 5000,
    failedCount: Math.floor(Math.random() * 50),
    failedAmount: Math.floor(Math.random() * 50000),
    refundCount: Math.floor(Math.random() * 30),
    refundAmount: Math.floor(Math.random() * 30000),
    feeAmount: Math.floor(Math.random() * 5000),
    actualAmount: Math.floor(Math.random() * 895000) + 5000,
    status: ['pending', 'processing', 'completed', 'failed'][Math.floor(Math.random() * 4)] as any,
    reportPath: Math.random() > 0.3 ? `reports/reconciliation_${index + 1}.pdf` : undefined,
    errorMessage: Math.random() > 0.7 ? '数据格式错误' : undefined,
    createdAt: new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    processedBy: Math.random() > 0.3 ? `processor_${Math.floor(Math.random() * 5) + 1}` : undefined
  }
})

// 对账差异Mock数据
export const mockReconciliationDifferences: ReconciliationDifference[] = Array.from({ length: 15 }, (_, index) => ({
  id: `difference_${index + 1}`,
  reconciliationId: `reconciliation_${Math.floor(index / 3) + 1}`,
  type: ['missing', 'amount_mismatch', 'status_mismatch', 'duplicate'][Math.floor(Math.random() * 4)] as any,
  orderId: `order_${Math.floor(index / 2) + 1}`,
  paymentId: `payment_${index + 1}`,
  systemAmount: Math.floor(Math.random() * 10000) + 100,
  channelAmount: Math.floor(Math.random() * 10000) + 100,
  differenceAmount: Math.floor(Math.random() * 1000),
  description: ['系统记录但渠道无记录', '金额不匹配', '状态不一致', '重复记录'][Math.floor(Math.random() * 4)],
  status: ['pending', 'resolved', 'ignored'][Math.floor(Math.random() * 3)] as any,
  resolvedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  resolvedBy: Math.random() > 0.5 ? `processor_${Math.floor(Math.random() * 5) + 1}` : undefined,
  resolveNote: Math.random() > 0.5 ? '已手动调整' : undefined,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
}))

// 支付统计Mock数据
export const mockPaymentStatistics: PaymentStatistics = {
  date: new Date().toISOString().split('T')[0],
  totalCount: 1250,
  totalAmount: 2500000,
  successCount: 1180,
  successAmount: 2350000,
  failedCount: 50,
  failedAmount: 100000,
  refundCount: 20,
  refundAmount: 50000,
  channelStats: [
    {
      channel: '支付宝',
      count: 600,
      amount: 1200000,
      successRate: 0.95,
      averageAmount: 2000
    },
    {
      channel: '微信支付',
      count: 500,
      amount: 1000000,
      successRate: 0.94,
      averageAmount: 2000
    },
    {
      channel: '银联支付',
      count: 150,
      amount: 300000,
      successRate: 0.93,
      averageAmount: 2000
    }
  ],
  methodStats: [
    {
      method: '扫码支付',
      count: 800,
      amount: 1600000,
      successRate: 0.95,
      averageAmount: 2000
    },
    {
      method: '手机支付',
      count: 350,
      amount: 700000,
      successRate: 0.94,
      averageAmount: 2000
    },
    {
      method: '网页支付',
      count: 100,
      amount: 200000,
      successRate: 0.90,
      averageAmount: 2000
    }
  ],
  hourlyStats: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: Math.floor(Math.random() * 100) + 10,
    amount: Math.floor(Math.random() * 200000) + 10000
  })),
  riskStats: {
    highRiskCount: 15,
    mediumRiskCount: 50,
    lowRiskCount: 1185,
    blockedCount: 5,
    manualReviewCount: 25
  }
}

// 支付配置Mock数据
export const mockPaymentConfig: PaymentConfig = {
  autoReconciliation: true,
  reconciliationTime: '02:00',
  riskControlEnabled: true,
  alertEnabled: true,
  alertEmails: ['admin@example.com', 'finance@example.com'],
  supportedCurrencies: ['CNY', 'USD', 'EUR'],
  defaultCurrency: 'CNY',
  exchangeRateProvider: 'alipay',
  settlementCycle: 'T1',
  minimumAmount: 0.01,
  maximumAmount: 50000,
  idempotencyEnabled: true,
  webhookRetryCount: 3,
  paymentTimeout: 900
}

// 生成历史统计数据
export const generateHistoricalStatistics = (days: number): PaymentStatistics[] => {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - index)

    const totalCount = Math.floor(Math.random() * 1000) + 500
    const totalAmount = totalCount * (Math.random() * 3000 + 1000)

    return {
      date: date.toISOString().split('T')[0],
      totalCount,
      totalAmount,
      successCount: Math.floor(totalCount * (0.9 + Math.random() * 0.08)),
      successAmount: totalAmount * (0.9 + Math.random() * 0.08),
      failedCount: Math.floor(totalCount * (0.02 + Math.random() * 0.03)),
      failedAmount: totalAmount * (0.02 + Math.random() * 0.03),
      refundCount: Math.floor(totalCount * 0.02),
      refundAmount: totalAmount * 0.02,
      channelStats: mockPaymentStatistics.channelStats,
      methodStats: mockPaymentStatistics.methodStats,
      hourlyStats: mockPaymentStatistics.hourlyStats,
      riskStats: mockPaymentStatistics.riskStats
    }
  })
}
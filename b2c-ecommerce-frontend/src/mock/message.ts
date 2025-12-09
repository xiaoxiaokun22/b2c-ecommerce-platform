// 消息通知模块 Mock 数据

// 消息模板数据
export const mockMessageTemplates = [
  {
    id: 'TPL001',
    name: '订单创建通知',
    type: 'sms', // sms, email, in_app
    channel: 'sms',
    businessType: 'order_created',
    title: '订单创建成功',
    content: '尊敬的用户，您的订单{orderNo}已创建成功，订单金额为{amount}元，请及时支付。',
    variables: [
      { name: 'orderNo', label: '订单号', type: 'string', required: true },
      { name: 'amount', label: '订单金额', type: 'number', required: true }
    ],
    status: 'active', // active, inactive
    usageCount: 5234,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-10 15:30:00',
    creator: '系统管理员'
  },
  {
    id: 'TPL002',
    name: '支付成功通知',
    type: 'email',
    channel: 'email',
    businessType: 'payment_success',
    title: '支付成功通知',
    content: '尊敬的用户，您的订单{orderNo}已支付成功，我们将尽快为您发货。',
    variables: [
      { name: 'orderNo', label: '订单号', type: 'string', required: true },
      { name: 'productName', label: '商品名称', type: 'string', required: false }
    ],
    status: 'active',
    usageCount: 3891,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-08 14:20:00',
    creator: '运营小二'
  },
  {
    id: 'TPL003',
    name: '发货通知',
    type: 'in_app',
    channel: 'in_app',
    businessType: 'order_shipped',
    title: '您的订单已发货',
    content: '您的订单{orderNo}已发货，快递单号：{trackingNo}，预计{estimatedTime}送达。',
    variables: [
      { name: 'orderNo', label: '订单号', type: 'string', required: true },
      { name: 'trackingNo', label: '快递单号', type: 'string', required: true },
      { name: 'estimatedTime', label: '预计送达时间', type: 'string', required: true }
    ],
    status: 'active',
    usageCount: 2156,
    createTime: '2024-01-02 09:30:00',
    updateTime: '2024-01-09 11:45:00',
    creator: '物流管理员'
  },
  {
    id: 'TPL004',
    name: '密码重置通知',
    type: 'email',
    channel: 'email',
    businessType: 'password_reset',
    title: '密码重置验证码',
    content: '您正在重置密码，验证码为：{verificationCode}，5分钟内有效。',
    variables: [
      { name: 'verificationCode', label: '验证码', type: 'string', required: true }
    ],
    status: 'active',
    usageCount: 892,
    createTime: '2023-12-15 16:20:00',
    updateTime: '2024-01-05 10:15:00',
    creator: '安全专员'
  },
  {
    id: 'TPL005',
    name: '促销活动通知',
    type: 'sms',
    channel: 'sms',
    businessType: 'promotion',
    title: '限时优惠活动',
    content: '【限时优惠】{promotionName}火热进行中，{discountInfo}，活动截止{endTime}，速来抢购！',
    variables: [
      { name: 'promotionName', label: '活动名称', type: 'string', required: true },
      { name: 'discountInfo', label: '优惠信息', type: 'string', required: true },
      { name: 'endTime', label: '活动截止时间', type: 'string', required: true }
    ],
    status: 'inactive',
    usageCount: 15678,
    createTime: '2023-11-20 14:00:00',
    updateTime: '2024-01-01 00:00:00',
    creator: '市场推广'
  }
]

// 消息发送记录
export const mockMessageRecords = [
  {
    id: 'MSG001',
    templateId: 'TPL001',
    templateName: '订单创建通知',
    type: 'sms',
    channel: 'sms',
    sendType: 'single', // single, batch, trigger
    recipient: '13800138000',
    recipientCount: 1,
    subject: '订单创建成功',
    content: '尊敬的用户，您的订单ORD20240110001已创建成功，订单金额为299.00元，请及时支付。',
    status: 'success', // success, failed, pending, sending
    sendTime: '2024-01-10 10:30:00',
    completeTime: '2024-01-10 10:30:05',
    errorCode: null,
    errorMessage: null,
    operator: '系统自动',
    cost: 0.05,
    operatorId: 'system'
  },
  {
    id: 'MSG002',
    templateId: 'TPL002',
    templateName: '支付成功通知',
    type: 'email',
    channel: 'email',
    sendType: 'trigger',
    recipient: 'user@example.com',
    recipientCount: 1,
    subject: '支付成功通知',
    content: '尊敬的用户，您的订单ORD20240110002已支付成功，我们将尽快为您发货。',
    status: 'success',
    sendTime: '2024-01-10 11:15:00',
    completeTime: '2024-01-10 11:15:30',
    errorCode: null,
    errorMessage: null,
    operator: '系统自动',
    cost: 0,
    operatorId: 'system'
  },
  {
    id: 'MSG003',
    templateId: 'TPL005',
    templateName: '促销活动通知',
    type: 'sms',
    channel: 'sms',
    sendType: 'batch',
    recipient: '10000个用户',
    recipientCount: 10000,
    subject: '限时优惠活动',
    content: '【限时优惠】双十一大促火热进行中，全场5折起，活动截止2024-01-15 23:59:59，速来抢购！',
    status: 'success',
    sendTime: '2024-01-08 20:00:00',
    completeTime: '2024-01-08 20:15:30',
    errorCode: null,
    errorMessage: null,
    operator: '运营小二',
    cost: 500,
    operatorId: 'operator001'
  },
  {
    id: 'MSG004',
    templateId: 'TPL004',
    templateName: '密码重置通知',
    type: 'email',
    channel: 'email',
    sendType: 'trigger',
    recipient: 'test@test.com',
    recipientCount: 1,
    subject: '密码重置验证码',
    content: '您正在重置密码，验证码为：685423，5分钟内有效。',
    status: 'failed',
    sendTime: '2024-01-09 15:45:00',
    completeTime: '2024-01-09 15:45:30',
    errorCode: 'EMAIL_DELIVERY_FAILED',
    errorMessage: '邮件服务器连接超时',
    operator: '系统自动',
    cost: 0,
    operatorId: 'system'
  },
  {
    id: 'MSG005',
    templateId: 'TPL003',
    templateName: '发货通知',
    type: 'in_app',
    channel: 'in_app',
    sendType: 'trigger',
    recipient: '用户ID12345',
    recipientCount: 1,
    subject: '您的订单已发货',
    content: '您的订单ORD20240109003已发货，快递单号：SF1234567890，预计2024-01-12送达。',
    status: 'pending',
    sendTime: '2024-01-10 14:20:00',
    completeTime: null,
    errorCode: null,
    errorMessage: null,
    operator: '系统自动',
    cost: 0,
    operatorId: 'system'
  }
]

// 通知规则数据
export const mockNotificationRules = [
  {
    id: 'RULE001',
    name: '订单创建自动通知',
    description: '用户创建订单后自动发送短信和站内信通知',
    businessEvent: 'order.created',
    condition: {
      triggerMode: 'immediate', // immediate, delay, schedule
      delayTime: 0,
      filters: [
        { field: 'orderAmount', operator: '>', value: 0 }
      ]
    },
    actions: [
      {
        type: 'send_message',
        templateId: 'TPL001',
        channel: 'sms',
        recipientType: 'user',
        recipientExpression: '{userId}'
      },
      {
        type: 'send_message',
        templateId: 'TPL001',
        channel: 'in_app',
        recipientType: 'user',
        recipientExpression: '{userId}'
      }
    ],
    status: 'active',
    priority: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-05 15:30:00',
    creator: '系统管理员',
    lastTriggerTime: '2024-01-10 11:45:00'
  },
  {
    id: 'RULE002',
    name: '支付成功延迟通知',
    description: '支付成功后30分钟发送邮件通知',
    businessEvent: 'payment.success',
    condition: {
      triggerMode: 'delay',
      delayTime: 30,
      delayUnit: 'minute',
      filters: [
        { field: 'paymentAmount', operator: '>', value: 100 }
      ]
    },
    actions: [
      {
        type: 'send_message',
        templateId: 'TPL002',
        channel: 'email',
        recipientType: 'user',
        recipientExpression: '{userId}'
      }
    ],
    status: 'active',
    priority: 2,
    createTime: '2024-01-02 09:30:00',
    updateTime: '2024-01-08 14:20:00',
    creator: '运营小二',
    lastTriggerTime: '2024-01-10 12:00:00'
  },
  {
    id: 'RULE003',
    name: '发货自动通知',
    description: '订单发货后立即发送站内信',
    businessEvent: 'order.shipped',
    condition: {
      triggerMode: 'immediate',
      delayTime: 0,
      filters: []
    },
    actions: [
      {
        type: 'send_message',
        templateId: 'TPL003',
        channel: 'in_app',
        recipientType: 'user',
        recipientExpression: '{userId}'
      }
    ],
    status: 'active',
    priority: 1,
    createTime: '2024-01-03 11:00:00',
    updateTime: '2024-01-03 11:00:00',
    creator: '物流管理员',
    lastTriggerTime: '2024-01-10 09:15:00'
  },
  {
    id: 'RULE004',
    name: '会员生日祝福',
    description: '会员生日当天发送祝福短信',
    businessEvent: 'member.birthday',
    condition: {
      triggerMode: 'schedule',
      scheduleTime: '09:00:00',
      filters: [
        { field: 'memberLevel', operator: '>=', value: 1 }
      ]
    },
    actions: [
      {
        type: 'send_message',
        templateId: 'TPL006',
        channel: 'sms',
        recipientType: 'user',
        recipientExpression: '{userId}'
      }
    ],
    status: 'active',
    priority: 3,
    createTime: '2023-12-20 16:00:00',
    updateTime: '2024-01-01 10:00:00',
    creator: '会员运营',
    lastTriggerTime: '2024-01-09 09:00:00'
  },
  {
    id: 'RULE005',
    name: '密码重置安全验证',
    description: '用户请求重置密码时发送验证码',
    businessEvent: 'user.password_reset',
    condition: {
      triggerMode: 'immediate',
      delayTime: 0,
      filters: []
    },
    actions: [
      {
        type: 'send_message',
        templateId: 'TPL004',
        channel: 'email',
        recipientType: 'user',
        recipientExpression: '{email}'
      }
    ],
    status: 'active',
    priority: 1,
    createTime: '2023-12-15 15:00:00',
    updateTime: '2024-01-01 00:00:00',
    creator: '安全专员',
    lastTriggerTime: '2024-01-10 16:30:00'
  }
]

// 消息统计数据
export const mockMessageStatistics = {
  // 概览数据
  overview: {
    totalMessages: 125678,
    todayMessages: 2345,
    successRate: 98.5,
    avgDeliveryTime: 2.3,
    totalCost: 56789.50
  },
  // 发送渠道分布
  channelDistribution: [
    { channel: '短信', count: 45678, percentage: 36.3, cost: 45678.00 },
    { channel: '邮件', count: 56789, percentage: 45.2, cost: 11111.50 },
    { channel: '站内信', count: 23211, percentage: 18.5, cost: 0 }
  ],
  // 消息类型分布
  messageTypeDistribution: [
    { type: '营销推广', count: 34567, percentage: 27.5 },
    { type: '订单通知', count: 45678, percentage: 36.3 },
    { type: '安全验证', count: 23456, percentage: 18.7 },
    { type: '系统通知', count: 15678, percentage: 12.5 },
    { type: '其他', count: 5300, percentage: 4.2 }
  ],
  // 发送趋势（最近7天）
  sendTrend: [
    { date: '2024-01-04', total: 3456, success: 3412, failed: 44, successRate: 98.7 },
    { date: '2024-01-05', total: 3890, success: 3834, failed: 56, successRate: 98.6 },
    { date: '2024-01-06', total: 4123, success: 4067, failed: 56, successRate: 98.6 },
    { date: '2024-01-07', total: 3789, success: 3745, failed: 44, successRate: 98.8 },
    { date: '2024-01-08', total: 4567, success: 4498, failed: 69, successRate: 98.5 },
    { date: '2024-01-09', total: 4234, success: 4178, failed: 56, successRate: 98.7 },
    { date: '2024-01-10', total: 2345, success: 2309, failed: 36, successRate: 98.5 }
  ],
  // 热门模板使用统计
  topTemplates: [
    { templateId: 'TPL005', templateName: '促销活动通知', usageCount: 15678 },
    { templateId: 'TPL002', templateName: '支付成功通知', usageCount: 8934 },
    { templateId: 'TPL001', templateName: '订单创建通知', usageCount: 7523 },
    { templateId: 'TPL004', templateName: '密码重置通知', usageCount: 4321 },
    { templateId: 'TPL003', templateName: '发货通知', usageCount: 3567 }
  ],
  // 失败原因统计
  failureReasons: [
    { reason: '手机号码无效', count: 45, percentage: 12.5 },
    { reason: '邮箱地址错误', count: 67, percentage: 18.6 },
    { reason: '服务器超时', count: 89, percentage: 24.7 },
    { reason: '频率限制', count: 56, percentage: 15.6 },
    { reason: '其他原因', count: 103, percentage: 28.6 }
  ],
  // 成本分析
  costAnalysis: {
    totalCost: 56789.50,
    monthlyCost: [
      { month: '2023-08', cost: 4567.80 },
      { month: '2023-09', cost: 5234.50 },
      { month: '2023-10', cost: 6123.20 },
      { month: '2023-11', cost: 7890.40 },
      { month: '2023-12', cost: 8956.30 },
      { month: '2024-01', cost: 24017.30 }
    ],
    channelCost: {
      sms: 45678.00,
      email: 11111.50,
      in_app: 0
    }
  },
  // 发送时间分布
  timeDistribution: [
    { hour: '00-02', count: 1234 },
    { hour: '02-04', count: 567 },
    { hour: '04-06', count: 890 },
    { hour: '06-08', count: 2345 },
    { hour: '08-10', count: 3456 },
    { hour: '10-12', count: 4567 },
    { hour: '12-14', count: 5678 },
    { hour: '14-16', count: 4567 },
    { hour: '16-18', count: 3456 },
    { hour: '18-20', count: 2345 },
    { hour: '20-22', count: 3456 },
    { hour: '22-24', count: 2345 }
  ]
}
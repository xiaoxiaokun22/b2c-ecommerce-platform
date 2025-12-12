// 营销管理模块 Mock 数据

// 促销活动数据
export const mockPromotions = [
  {
    id: 'PROMO001',
    name: '双十一满减优惠',
    type: 'full_reduction', // full_reduction, discount, limited_offer
    description: '满200减30，满500减100',
    startTime: '2024-11-01 00:00:00',
    endTime: '2024-11-11 23:59:59',
    status: 'active', // pending, active, paused, ended
    rules: [
      {
        id: 'RULE001',
        minAmount: 200,
        discountAmount: 30,
        discountType: 'amount'
      },
      {
        id: 'RULE002',
        minAmount: 500,
        discountAmount: 100,
        discountType: 'amount'
      }
    ],
    applicableProducts: ['PRD001', 'PRD002', 'PRD003'],
    applicableCategories: ['手机数码', '电脑办公'],
    maxUsagePerUser: 1,
    totalUsage: 5234,
    totalDiscount: 358900,
    creator: '张经理',
    createTime: '2024-10-25 10:30:00',
    updateTime: '2024-11-05 15:20:00'
  },
  {
    id: 'PROMO002',
    name: '新用户专享折扣',
    type: 'discount',
    description: '新用户首单8折优惠',
    startTime: '2024-01-01 00:00:00',
    endTime: '2024-12-31 23:59:59',
    status: 'active',
    rules: [
      {
        id: 'RULE003',
        discountRate: 0.8,
        discountType: 'percentage',
        maxDiscountAmount: 200
      }
    ],
    applicableProducts: [],
    applicableCategories: [],
    userCondition: 'new_user',
    maxUsagePerUser: 1,
    totalUsage: 892,
    totalDiscount: 45600,
    creator: '李主管',
    createTime: '2023-12-28 14:20:00',
    updateTime: '2024-01-10 09:15:00'
  },
  {
    id: 'PROMO003',
    name: '限时特价活动',
    type: 'limited_offer',
    description: '指定商品限时5折',
    startTime: '2024-01-10 10:00:00',
    endTime: '2024-01-15 23:59:59',
    status: 'active',
    rules: [
      {
        id: 'RULE004',
        discountRate: 0.5,
        discountType: 'percentage'
      }
    ],
    applicableProducts: ['PRD004', 'PRD005'],
    applicableCategories: ['家用电器'],
    maxUsagePerUser: 5,
    totalUsage: 2156,
    totalDiscount: 289700,
    creator: '王运营',
    createTime: '2024-01-08 16:45:00',
    updateTime: '2024-01-10 10:00:00'
  }
]

// 优惠券数据
export const mockCoupons = [
  {
    id: 'COUPON001',
    name: '新人专享券',
    type: 'full_reduction', // full_reduction, discount, cash
    denomination: 50,
    condition: {
      minAmount: 200
    },
    validDays: 30,
    totalQuantity: 10000,
    usedQuantity: 3567,
    receivedQuantity: 6234,
    status: 'active', // active, inactive, expired
    receiveCondition: 'new_user',
    receiveStartTime: '2024-01-01 00:00:00',
    receiveEndTime: '2024-12-31 23:59:59',
    validStartTime: '2024-01-01 00:00:00',
    validEndTime: '2024-12-31 23:59:59',
    description: '新用户注册即送50元优惠券，满200可用',
    creator: '运营团队',
    createTime: '2023-12-25 10:00:00'
  },
  {
    id: 'COUPON002',
    name: '会员生日券',
    type: 'discount',
    denomination: 0.9,
    condition: {
      minAmount: 100
    },
    validDays: 7,
    totalQuantity: 50000,
    usedQuantity: 12456,
    receivedQuantity: 25678,
    status: 'active',
    receiveCondition: 'member_birthday',
    receiveStartTime: '2024-01-01 00:00:00',
    receiveEndTime: '2024-12-31 23:59:59',
    validStartTime: '', // 动态计算
    validEndTime: '', // 动态计算
    description: '会员生日当月可领取9折优惠券，全品类可用',
    creator: '会员运营',
    createTime: '2023-12-20 15:30:00'
  },
  {
    id: 'COUPON003',
    name: '品类专属券',
    type: 'full_reduction',
    denomination: 100,
    condition: {
      minAmount: 500,
      categories: ['手机数码', '电脑办公']
    },
    validDays: 15,
    totalQuantity: 3000,
    usedQuantity: 890,
    receivedQuantity: 1234,
    status: 'active',
    receiveCondition: 'all_user',
    receiveStartTime: '2024-01-05 00:00:00',
    receiveEndTime: '2024-01-31 23:59:59',
    validStartTime: '2024-01-05 00:00:00',
    validEndTime: '2024-02-15 23:59:59',
    description: '数码家电专场，满500减100优惠券',
    creator: '品类运营',
    createTime: '2024-01-03 11:20:00'
  }
]

// 秒杀活动数据
export const mockSeckillActivities = [
  {
    id: 'SECKILL001',
    name: '今日秒杀场',
    date: '2024-01-10',
    sessions: [
      {
        id: 'SESSION001',
        name: '10点场',
        startTime: '10:00:00',
        endTime: '10:30:00',
        status: 'active', // waiting, active, ended
        products: [
          {
            productId: 'PRD001',
            productName: 'Apple iPhone 14 Pro',
            originalPrice: 8999,
            seckillPrice: 6999,
            stock: 100,
            sold: 89,
            imageUrl: '/images/products/iphone14pro.jpg'
          },
          {
            productId: 'PRD002',
            productName: 'Sony WH-1000XM5 降噪耳机',
            originalPrice: 2499,
            seckillPrice: 1599,
            stock: 200,
            sold: 156,
            imageUrl: '/images/products/sony-headphone.jpg'
          }
        ]
      },
      {
        id: 'SESSION002',
        name: '14点场',
        startTime: '14:00:00',
        endTime: '14:30:00',
        status: 'waiting',
        products: [
          {
            productId: 'PRD003',
            productName: '戴森V15吸尘器',
            originalPrice: 4999,
            seckillPrice: 3299,
            stock: 50,
            sold: 0,
            imageUrl: '/images/products/dyson-v15.jpg'
          }
        ]
      },
      {
        id: 'SESSION003',
        name: '20点场',
        startTime: '20:00:00',
        endTime: '20:30:00',
        status: 'waiting',
        products: [
          {
            productId: 'PRD004',
            productName: '小米智能电视 65寸',
            originalPrice: 3999,
            seckillPrice: 2499,
            stock: 80,
            sold: 0,
            imageUrl: '/images/products/mi-tv.jpg'
          }
        ]
      }
    ],
    status: 'active', // draft, active, inactive, ended
    description: '今日限时秒杀活动，超值商品抢购中！',
    recommended: true,
    rules: ['limit_per_user', 'no_discount'],
    creator: '秒杀运营',
    createTime: '2024-01-09 18:00:00'
  },
  {
    id: 'SECKILL002',
    name: '明日秒杀场',
    date: '2024-01-11',
    sessions: [
      {
        id: 'SESSION004',
        name: '10点场',
        startTime: '10:00:00',
        endTime: '10:30:00',
        status: 'waiting',
        products: [
          {
            productId: 'PRD005',
            productName: 'Apple Watch Series 9',
            originalPrice: 3199,
            seckillPrice: 2299,
            stock: 150,
            sold: 0,
            imageUrl: '/images/products/apple-watch.jpg'
          }
        ]
      }
    ],
    status: 'active', // draft, active, inactive, ended
    description: '明日秒杀预告，精彩商品抢先看！',
    recommended: false,
    rules: ['limit_per_user'],
    creator: '秒杀运营',
    createTime: '2024-01-10 09:00:00'
  },
  {
    id: 'SECKILL003',
    name: '昨日秒杀场',
    date: '2024-01-09',
    sessions: [
      {
        id: 'SESSION005',
        name: '20点场',
        startTime: '20:00:00',
        endTime: '20:30:00',
        status: 'ended',
        products: [
          {
            productId: 'PRD009',
            productName: 'Nintendo Switch OLED',
            originalPrice: 2599,
            seckillPrice: 1999,
            stock: 100,
            sold: 100,
            imageUrl: '/images/products/switch.jpg'
          },
          {
            productId: 'PRD010',
            productName: '索尼PS5光驱版',
            originalPrice: 3899,
            seckillPrice: 3099,
            stock: 50,
            sold: 45,
            imageUrl: '/images/products/ps5.jpg'
          }
        ]
      }
    ],
    status: 'ended', // draft, active, inactive, ended
    description: '昨日秒杀活动已结束，敬请关注今日活动！',
    recommended: false,
    rules: ['limit_per_user', 'no_discount', 'no_points'],
    creator: '秒杀运营',
    createTime: '2024-01-08 15:00:00'
  }
]

// 团购活动数据
export const mockGroupBuyingActivities = [
  {
    id: 'GROUP001',
    name: '小米空气净化器团购',
    productId: 'PRD006',
    productName: '小米空气净化器 Pro H',
    originalPrice: 1499,
    groupPrice: 999,
    groupSize: 20, // 成团人数
    currentGroupSize: 18,
    maxGroupCount: 100, // 最大开团数
    currentGroupCount: 45,
    startTime: '2024-01-05 00:00:00',
    endTime: '2024-01-15 23:59:59',
    status: 'active', // waiting, active, ended
    description: '20人成团，专享价999元，原价1499元',
    rules: {
      minParticipants: 20,
      maxParticipants: 50,
      groupValidHours: 24
    },
    totalOrders: 890,
    totalSavings: 445100,
    creator: '团购运营',
    createTime: '2024-01-03 10:30:00'
  },
  {
    id: 'GROUP002',
    name: '戴森吹风机团购',
    productId: 'PRD007',
    productName: '戴森HD08吹风机',
    originalPrice: 2990,
    groupPrice: 1990,
    groupSize: 10,
    currentGroupSize: 10,
    maxGroupCount: 50,
    currentGroupCount: 23,
    startTime: '2024-01-08 00:00:00',
    endTime: '2024-01-12 23:59:59',
    status: 'active',
    description: '10人成团，专享价1990元，立省1000元',
    rules: {
      minParticipants: 10,
      maxParticipants: 30,
      groupValidHours: 12
    },
    totalOrders: 230,
    totalSavings: 230000,
    creator: '团购运营',
    createTime: '2024-01-06 14:20:00'
  },
  {
    id: 'GROUP003',
    name: '智能手环团购',
    productId: 'PRD008',
    productName: '华为手环8',
    originalPrice: 269,
    groupPrice: 199,
    groupSize: 30,
    currentGroupSize: 25,
    maxGroupCount: 200,
    currentGroupCount: 67,
    startTime: '2024-01-10 00:00:00',
    endTime: '2024-01-20 23:59:59',
    status: 'active',
    description: '30人成团，仅需199元，健康生活从此开始',
    rules: {
      minParticipants: 30,
      maxParticipants: 100,
      groupValidHours: 48
    },
    totalOrders: 2010,
    totalSavings: 140700,
    creator: '团购运营',
    createTime: '2024-01-09 11:45:00'
  },
  // 待开始活动
  {
    id: 'GROUP004',
    name: '美的电饭煲团购',
    productId: 'PRD011',
    productName: '美的电饭煲 MB-FB40S701',
    originalPrice: 399,
    groupPrice: 279,
    groupSize: 50,
    currentGroupSize: 0,
    maxGroupCount: 100,
    currentGroupCount: 0,
    startTime: '2024-01-15 00:00:00',
    endTime: '2024-01-25 23:59:59',
    status: 'waiting',
    description: '50人成团，专享价279元， IH电磁加热，柴火饭香',
    rules: {
      minParticipants: 50,
      maxParticipants: 200,
      groupValidHours: 72
    },
    totalOrders: 0,
    totalSavings: 0,
    creator: '团购运营',
    createTime: '2024-01-11 09:30:00'
  },
  {
    id: 'GROUP005',
    name: '九阳豆浆机团购',
    productId: 'PRD012',
    productName: '九阳豆浆机 DJ13B-D08D',
    originalPrice: 299,
    groupPrice: 189,
    groupSize: 100,
    currentGroupSize: 0,
    maxGroupCount: 500,
    currentGroupCount: 0,
    startTime: '2024-01-18 00:00:00',
    endTime: '2024-01-28 23:59:59',
    status: 'waiting',
    description: '100人成团，破壁免滤，营养健康',
    rules: {
      minParticipants: 100,
      maxParticipants: 500,
      groupValidHours: 24
    },
    totalOrders: 0,
    totalSavings: 0,
    creator: '团购运营',
    createTime: '2024-01-12 16:20:00'
  },
  // 草稿状态活动
  {
    id: 'GROUP006',
    name: '苏泊尔压力锅团购',
    productId: 'PRD013',
    productName: '苏泊尔电压力锅 CYSB50YCW10D',
    originalPrice: 599,
    groupPrice: 399,
    groupSize: 30,
    currentGroupSize: 0,
    maxGroupCount: 50,
    currentGroupCount: 0,
    startTime: '2024-01-20 00:00:00',
    endTime: '2024-01-30 23:59:59',
    status: 'draft',
    description: '30人成团，智能电压力锅，一键美味',
    rules: {
      minParticipants: 30,
      maxParticipants: 150,
      groupValidHours: 48
    },
    totalOrders: 0,
    totalSavings: 0,
    creator: '团购运营',
    createTime: '2024-01-13 10:00:00'
  },
  {
    id: 'GROUP007',
    name: '飞利浦电动牙刷团购',
    productId: 'PRD014',
    productName: '飞利浦电动牙刷 HX6730',
    originalPrice: 399,
    groupPrice: 259,
    groupSize: 20,
    currentGroupSize: 0,
    maxGroupCount: 30,
    currentGroupCount: 0,
    startTime: '2024-01-22 00:00:00',
    endTime: '2024-01-31 23:59:59',
    status: 'draft',
    description: '20人成团，声波震动，清洁护龈',
    rules: {
      minParticipants: 20,
      maxParticipants: 100,
      groupValidHours: 36
    },
    totalOrders: 0,
    totalSavings: 0,
    creator: '团购运营',
    createTime: '2024-01-13 14:30:00'
  },
  // 已结束活动
  {
    id: 'GROUP008',
    name: '格力空调团购',
    productId: 'PRD015',
    productName: '格力空调 1.5匹 变频',
    originalPrice: 2899,
    groupPrice: 2299,
    groupSize: 20,
    currentGroupSize: 20,
    maxGroupCount: 100,
    currentGroupCount: 100,
    startTime: '2024-01-01 00:00:00',
    endTime: '2024-01-10 23:59:59',
    status: 'ended',
    description: '20人成团，变频节能，静音舒适',
    rules: {
      minParticipants: 20,
      maxParticipants: 200,
      groupValidHours: 24
    },
    totalOrders: 2000,
    totalSavings: 1200000,
    creator: '团购运营',
    createTime: '2023-12-28 10:00:00'
  },
  {
    id: 'GROUP009',
    name: '海尔冰箱团购',
    productId: 'PRD016',
    productName: '海尔冰箱 BCD-215STPD',
    originalPrice: 1899,
    groupPrice: 1499,
    groupSize: 50,
    currentGroupSize: 50,
    maxGroupCount: 50,
    currentGroupCount: 50,
    startTime: '2023-12-20 00:00:00',
    endTime: '2023-12-31 23:59:59',
    status: 'ended',
    description: '50人成团，三门冰箱，节能保鲜',
    rules: {
      minParticipants: 50,
      maxParticipants: 100,
      groupValidHours: 48
    },
    totalOrders: 2500,
    totalSavings: 1000000,
    creator: '团购运营',
    createTime: '2023-12-18 15:30:00'
  },
  // 停用状态活动
  {
    id: 'GROUP010',
    name: '松下剃须刀团购',
    productId: 'PRD017',
    productName: '松下剃须刀 ES-ST29',
    originalPrice: 199,
    groupPrice: 129,
    groupSize: 30,
    currentGroupSize: 12,
    maxGroupCount: 100,
    currentGroupCount: 5,
    startTime: '2024-01-08 00:00:00',
    endTime: '2024-01-18 23:59:59',
    status: 'inactive',
    description: '30人成团，3刀头浮动系统，舒适剃净',
    rules: {
      minParticipants: 30,
      maxParticipants: 100,
      groupValidHours: 24
    },
    totalOrders: 60,
    totalSavings: 4200,
    creator: '团购运营',
    createTime: '2024-01-07 11:00:00'
  },
  {
    id: 'GROUP011',
    name: '小米电视团购',
    productId: 'PRD018',
    productName: '小米电视 EA55 2022款 55英寸',
    originalPrice: 1799,
    groupPrice: 1399,
    groupSize: 100,
    currentGroupSize: 35,
    maxGroupCount: 200,
    currentGroupCount: 10,
    startTime: '2024-01-09 00:00:00',
    endTime: '2024-01-19 23:59:59',
    status: 'inactive',
    description: '100人成团，4K超高清，智能语音',
    rules: {
      minParticipants: 100,
      maxParticipants: 300,
      groupValidHours: 72
    },
    totalOrders: 350,
    totalSavings: 140000,
    creator: '团购运营',
    createTime: '2024-01-08 09:45:00'
  }
]

// 营销数据分析数据
export const mockMarketingAnalysis = {
  // 营销概览
  overview: {
    totalActivities: 156,
    activeActivities: 23,
    totalParticipants: 125678,
    totalSales: 15678900,
    totalDiscount: 2345678,
    avgROI: 4.8,
    conversionRate: 12.5
  },
  // 活动效果趋势
  activityTrend: [
    { date: '2024-01-04', activities: 15, participants: 5234, sales: 234567 },
    { date: '2024-01-05', activities: 18, participants: 6789, sales: 456789 },
    { date: '2024-01-06', activities: 22, participants: 8923, sales: 567890 },
    { date: '2024-01-07', activities: 20, participants: 7456, sales: 445678 },
    { date: '2024-01-08', activities: 25, participants: 10234, sales: 678901 },
    { date: '2024-01-09', activities: 28, participants: 11890, sales: 789012 },
    { date: '2024-01-10', activities: 23, participants: 9876, sales: 567890 }
  ],
  // 活动类型分布
  activityTypeDistribution: [
    { type: '促销活动', count: 89, percentage: 57.1 },
    { type: '优惠券', count: 123, percentage: 78.8 },
    { type: '秒杀活动', count: 156, percentage: 100 },
    { type: '团购活动', count: 45, percentage: 28.8 }
  ],
  // 活动效果排行
  topActivities: [
    {
      id: 'PROMO001',
      name: '双十一满减优惠',
      type: '促销活动',
      participants: 5234,
      sales: 2345678,
      roi: 5.2,
      conversionRate: 15.8
    },
    {
      id: 'SECKILL001',
      name: '今日秒杀场',
      type: '秒杀活动',
      participants: 8901,
      sales: 1567890,
      roi: 4.8,
      conversionRate: 22.5
    },
    {
      id: 'GROUP001',
      name: '小米空气净化器团购',
      type: '团购活动',
      participants: 2345,
      sales: 445678,
      roi: 3.9,
      conversionRate: 18.2
    }
  ],
  // 用户参与分析
  userParticipation: {
    newUsers: 23456,
    returningUsers: 102222,
    participationRate: 68.5,
    avgParticipationFrequency: 3.2
  },
  // 营销渠道效果
  channelEffectiveness: [
    { channel: '首页推广', exposure: 523456, clickRate: 8.5, conversionRate: 12.3 },
    { channel: '商品详情页', exposure: 234567, clickRate: 15.2, conversionRate: 18.9 },
    { channel: '购物车页', exposure: 123456, clickRate: 22.3, conversionRate: 25.6 },
    { channel: 'APP推送', exposure: 345678, clickRate: 6.8, conversionRate: 9.5 },
    { channel: '短信营销', exposure: 234567, clickRate: 4.2, conversionRate: 7.8 },
    { channel: '社交媒体', exposure: 456789, clickRate: 12.5, conversionRate: 15.6 }
  ],
  // ROI分析
  roiAnalysis: {
    totalInvestment: 2345678,
    totalRevenue: 15678900,
    totalROI: 5.69,
    monthlyROI: [
      { month: '2023-08', roi: 4.2 },
      { month: '2023-09', roi: 4.8 },
      { month: '2023-10', roi: 5.1 },
      { month: '2023-11', roi: 6.8 },
      { month: '2023-12', roi: 7.2 },
      { month: '2024-01', roi: 5.69 }
    ]
  }
}

// 活动参与记录
export const mockActivityRecords = [
  {
    id: 'RECORD001',
    activityId: 'PROMO001',
    activityName: '双十一满减优惠',
    userId: 'USER001',
    userNickname: '小明',
    activityType: 'promotion',
    participateTime: '2024-01-10 14:30:00',
    orderAmount: 299.99,
    discountAmount: 30,
    finalAmount: 269.99,
    status: 'completed'
  },
  {
    id: 'RECORD002',
    activityId: 'SECKILL001',
    activityName: '今日秒杀场-10点场',
    userId: 'USER002',
    userNickname: '小红',
    activityType: 'seckill',
    participateTime: '2024-01-10 10:05:00',
    orderAmount: 6999,
    discountAmount: 2000,
    finalAmount: 4999,
    status: 'completed'
  },
  {
    id: 'RECORD003',
    activityId: 'GROUP001',
    activityName: '小米空气净化器团购',
    userId: 'USER003',
    userNickname: '小张',
    activityType: 'group_buying',
    participateTime: '2024-01-09 16:45:00',
    orderAmount: 999,
    discountAmount: 500,
    finalAmount: 999,
    status: 'pending', // waiting for group formation
    groupId: 'GROUP001_001'
  }
]
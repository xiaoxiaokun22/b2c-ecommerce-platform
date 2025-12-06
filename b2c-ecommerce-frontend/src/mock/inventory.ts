// 库存管理模块 Mock 数据

// 商品库存数据
export const mockInventoryList = [
  {
    id: 'INV001',
    productId: 'PRD001',
    productCode: 'SKU001',
    productName: 'Apple iPhone 14 Pro 128GB',
    category: '手机数码',
    brand: 'Apple',
    specifications: {
      color: '深空黑色',
      storage: '128GB',
      model: 'A2884'
    },
    currentStock: 156,
    availableStock: 145,
    lockedStock: 11,
    safetyStock: 50,
    maxStock: 500,
    avgDailySales: 8.5,
    stockStatus: 'normal', // normal, low, warning, out_of_stock
    lastUpdateTime: '2024-01-10 14:30:25',
    warehouse: '华东仓',
    costPrice: 7999.00,
    marketPrice: 8999.00
  },
  {
    id: 'INV002',
    productId: 'PRD002',
    productCode: 'SKU002',
    productName: 'Apple iPhone 14 Pro 256GB',
    category: '手机数码',
    brand: 'Apple',
    specifications: {
      color: '银色',
      storage: '256GB',
      model: 'A2884'
    },
    currentStock: 89,
    availableStock: 85,
    lockedStock: 4,
    safetyStock: 50,
    maxStock: 400,
    avgDailySales: 12.3,
    stockStatus: 'low',
    lastUpdateTime: '2024-01-10 14:30:25',
    warehouse: '华东仓',
    costPrice: 8899.00,
    marketPrice: 9999.00
  },
  {
    id: 'INV003',
    productId: 'PRD003',
    productCode: 'SKU003',
    productName: 'Apple MacBook Pro 14英寸 M3 Pro',
    category: '电脑办公',
    brand: 'Apple',
    specifications: {
      color: '深空灰色',
      cpu: 'M3 Pro',
      memory: '18GB',
      storage: '512GB SSD'
    },
    currentStock: 12,
    availableStock: 8,
    lockedStock: 4,
    safetyStock: 30,
    maxStock: 100,
    avgDailySales: 3.2,
    stockStatus: 'warning',
    lastUpdateTime: '2024-01-10 14:30:25',
    warehouse: '华南仓',
    costPrice: 14999.00,
    marketPrice: 16999.00
  },
  {
    id: 'INV004',
    productId: 'PRD004',
    productCode: 'SKU004',
    productName: 'Sony WH-1000XM5 降噪耳机',
    category: '影音娱乐',
    brand: 'Sony',
    specifications: {
      color: '黑色',
      type: '头戴式',
      bluetooth: '5.2'
    },
    currentStock: 0,
    availableStock: 0,
    lockedStock: 0,
    safetyStock: 100,
    maxStock: 300,
    avgDailySales: 15.6,
    stockStatus: 'out_of_stock',
    lastUpdateTime: '2024-01-10 14:30:25',
    warehouse: '华北仓',
    costPrice: 1999.00,
    marketPrice: 2499.00
  },
  {
    id: 'INV005',
    productId: 'PRD005',
    productCode: 'SKU005',
    productName: '戴森V15吸尘器',
    category: '家用电器',
    brand: 'Dyson',
    specifications: {
      color: '金色',
      power: '220W',
      battery: '60分钟续航'
    },
    currentStock: 345,
    availableStock: 330,
    lockedStock: 15,
    safetyStock: 80,
    maxStock: 500,
    avgDailySales: 6.8,
    stockStatus: 'normal',
    lastUpdateTime: '2024-01-10 14:30:25',
    warehouse: '西南仓',
    costPrice: 3999.00,
    marketPrice: 4999.00
  }
]

// 库存变动记录
export const mockStockRecords = [
  {
    id: 'REC001',
    inventoryId: 'INV001',
    type: 'inbound', // inbound, outbound, adjust, transfer, loss
    changeQuantity: 100,
    beforeStock: 56,
    afterStock: 156,
    reason: '采购入库',
    batchNo: 'BATCH20240108001',
    supplier: 'Apple中国',
    operator: '张三',
    operatorTime: '2024-01-08 10:30:00',
    remark: '春节前补货'
  },
  {
    id: 'REC002',
    inventoryId: 'INV002',
    type: 'outbound',
    changeQuantity: -5,
    beforeStock: 94,
    afterStock: 89,
    reason: '订单出库',
    orderNo: 'ORD202401100001',
    operator: '李四',
    operatorTime: '2024-01-10 09:15:00',
    remark: '订单发货'
  },
  {
    id: 'REC003',
    inventoryId: 'INV003',
    type: 'adjust',
    changeQuantity: -8,
    beforeStock: 20,
    afterStock: 12,
    reason: '库存盘点调整',
    operator: '王五',
    operatorTime: '2024-01-09 16:45:00',
    remark: '实际盘点发现库存差异'
  },
  {
    id: 'REC004',
    inventoryId: 'INV004',
    type: 'outbound',
    changeQuantity: -25,
    beforeStock: 25,
    afterStock: 0,
    reason: '订单出库',
    orderNo: 'ORD202401100025',
    operator: '赵六',
    operatorTime: '2024-01-10 11:20:00',
    remark: '最后一批库存出库'
  },
  {
    id: 'REC005',
    inventoryId: 'INV005',
    type: 'inbound',
    changeQuantity: 200,
    beforeStock: 145,
    afterStock: 345,
    reason: '采购入库',
    batchNo: 'BATCH20240107002',
    supplier: '戴森中国',
    operator: '张三',
    operatorTime: '2024-01-07 14:00:00',
    remark: '常规补货'
  }
]

// 库存预警数据
export const mockInventoryAlerts = [
  {
    id: 'ALT001',
    inventoryId: 'INV002',
    alertType: 'low_stock', // low_stock, out_of_stock, overstock, slow_moving
    alertLevel: 'warning', // info, warning, error
    title: 'Apple iPhone 14 Pro 256GB 库存偏低',
    description: '当前库存89件，低于安全库存50件，预计7天后售罄',
    productName: 'Apple iPhone 14 Pro 256GB',
    productCode: 'SKU002',
    currentStock: 89,
    safetyStock: 50,
    daysOfSupply: 7.2,
    avgDailySales: 12.3,
    alertTime: '2024-01-10 08:00:00',
    status: 'unresolved', // resolved, unresolved
    warehouse: '华东仓'
  },
  {
    id: 'ALT002',
    inventoryId: 'INV003',
    alertType: 'low_stock',
    alertLevel: 'error',
    title: 'Apple MacBook Pro 14英寸 M3 Pro 库存严重不足',
    description: '当前库存12件，远低于安全库存30件，预计3天后售罄',
    productName: 'Apple MacBook Pro 14英寸 M3 Pro',
    productCode: 'SKU003',
    currentStock: 12,
    safetyStock: 30,
    daysOfSupply: 3.8,
    avgDailySales: 3.2,
    alertTime: '2024-01-10 08:30:00',
    status: 'unresolved',
    warehouse: '华南仓'
  },
  {
    id: 'ALT003',
    inventoryId: 'INV004',
    alertType: 'out_of_stock',
    alertLevel: 'error',
    title: 'Sony WH-1000XM5 降噪耳机 已售罄',
    description: '商品已售罄，请及时补货',
    productName: 'Sony WH-1000XM5 降噪耳机',
    productCode: 'SKU004',
    currentStock: 0,
    safetyStock: 100,
    daysOfSupply: 0,
    avgDailySales: 15.6,
    alertTime: '2024-01-10 09:00:00',
    status: 'unresolved',
    warehouse: '华北仓'
  },
  {
    id: 'ALT004',
    inventoryId: 'INV006',
    alertType: 'overstock',
    alertLevel: 'info',
    title: '小米智能手环7 库存积压',
    description: '当前库存1200件，超过最高库存限制，占用资金过多',
    productName: '小米智能手环7',
    productCode: 'SKU006',
    currentStock: 1200,
    maxStock: 800,
    avgDailySales: 8.5,
    inventoryTurnover: 2.5,
    alertTime: '2024-01-10 07:30:00',
    status: 'resolved',
    warehouse: '华东仓'
  },
  {
    id: 'ALT005',
    inventoryId: 'INV007',
    alertType: 'slow_moving',
    alertLevel: 'warning',
    title: '传统机械键盘 周转缓慢',
    description: '商品周转天数超过60天，建议采取促销措施',
    productName: '传统机械键盘',
    productCode: 'SKU007',
    currentStock: 156,
    avgDailySales: 0.8,
    inventoryTurnover: 1.2,
    daysSinceLastSale: 45,
    alertTime: '2024-01-10 06:00:00',
    status: 'unresolved',
    warehouse: '华北仓'
  }
]

// 库存分析数据
export const mockInventoryAnalysis = {
  // 库存概览
  overview: {
    totalProducts: 1256,
    totalSKUs: 3890,
    totalStockValue: 15678000,
    totalStockAmount: 125890,
    avgInventoryTurnover: 4.5,
    outOfStockProducts: 23,
    lowStockProducts: 89,
    overstockProducts: 45,
    slowMovingProducts: 67
  },
  // 库存周转率趋势
  turnoverTrend: [
    { month: '2023-08', turnover: 3.8 },
    { month: '2023-09', turnover: 4.2 },
    { month: '2023-10', turnover: 4.5 },
    { month: '2023-11', turnover: 5.1 },
    { month: '2023-12', turnover: 4.8 },
    { month: '2024-01', turnover: 4.5 }
  ],
  // 分类库存占比
  categoryDistribution: [
    { category: '手机数码', value: 35.2, stockValue: 5523456 },
    { category: '电脑办公', value: 28.7, stockValue: 4495686 },
    { category: '家用电器', value: 18.5, stockValue: 2890430 },
    { category: '影音娱乐', value: 10.3, stockValue: 1614834 },
    { category: '其他', value: 7.3, stockValue: 1143594 }
  ],
  // 库存状态分布
  stockStatusDistribution: [
    { status: '正常', count: 3456, percentage: 88.8 },
    { status: '库存偏低', count: 356, percentage: 9.1 },
    { status: '库存不足', count: 45, percentage: 1.2 },
    { status: '已售罄', count: 23, percentage: 0.6 },
    { status: '库存积压', count: 10, percentage: 0.3 }
  ],
  // 仓库库存分布
  warehouseDistribution: [
    { warehouse: '华东仓', stockValue: 6234567, percentage: 39.8 },
    { warehouse: '华南仓', stockValue: 4123456, percentage: 26.3 },
    { warehouse: '华北仓', stockValue: 3456789, percentage: 22.1 },
    { warehouse: '西南仓', stockValue: 1234567, percentage: 7.9 },
    { warehouse: '海外仓', stockValue: 628621, percentage: 4.0 }
  ],
  // 滞销商品分析
  slowMovingProducts: [
    {
      productCode: 'SKU007',
      productName: '传统机械键盘',
      category: '电脑配件',
      currentStock: 156,
      lastSaleDate: '2023-11-26',
      daysSinceLastSale: 45,
      avgDailySales: 0.8,
      stockValue: 23400,
      recommendation: '建议进行促销活动，清理滞销库存'
    },
    {
      productCode: 'SKU008',
      productName: '有线鼠标',
      category: '电脑配件',
      currentStock: 289,
      lastSaleDate: '2023-10-15',
      daysSinceLastSale: 87,
      avgDailySales: 0.3,
      stockValue: 14450,
      recommendation: '考虑下架或打包销售'
    }
  ],
  // 库存变动统计
  stockChangeStats: {
    totalInbound: 12567,
    totalOutbound: 11890,
    totalAdjust: -234,
    totalTransfer: 567,
    totalLoss: -89
  }
}

// 库存调整申请
export const mockInventoryAdjustments = [
  {
    id: 'ADJ001',
    inventoryId: 'INV003',
    type: '盘点调整', // 盘点调整, 报损调整, 盘盈调整
    adjustType: 'loss', // increase, decrease
    beforeStock: 20,
    adjustQuantity: -8,
    afterStock: 12,
    reason: '实际盘点发现库存差异',
    description: '月度盘点发现实际库存少于系统记录',
    attachments: ['inventory_check_20240109.pdf'],
    status: 'approved', // pending, approved, rejected
    applicant: '王五',
    applicantTime: '2024-01-09 15:30:00',
    approver: '张经理',
    approveTime: '2024-01-09 16:45:00',
    approveRemark: '同意调整，请加强库存管理'
  },
  {
    id: 'ADJ002',
    inventoryId: 'INV008',
    type: '报损调整',
    adjustType: 'decrease',
    beforeStock: 50,
    adjustQuantity: -5,
    afterStock: 45,
    reason: '商品包装损坏',
    description: '仓库移库过程中发现5件商品包装严重损坏，无法销售',
    attachments: ['damage_report_20240110.pdf', 'damage_photos.zip'],
    status: 'pending',
    applicant: '李四',
    applicantTime: '2024-01-10 10:15:00',
    approver: null,
    approveTime: null,
    approveRemark: null
  }
]

// 库存批次管理
export const mockInventoryBatches = [
  {
    id: 'BATCH001',
    inventoryId: 'INV001',
    batchNo: 'BATCH20240108001',
    quantity: 100,
    remainingQuantity: 87,
    productionDate: '2024-01-05',
    expiryDate: '2025-01-05',
    supplier: 'Apple中国',
    purchasePrice: 7999.00,
    status: 'active', // active, expired, sold_out
    warehouse: '华东仓',
    location: 'A区-01-01',
    inTime: '2024-01-08 10:30:00',
    lastOutTime: '2024-01-10 11:45:00'
  },
  {
    id: 'BATCH002',
    inventoryId: 'INV005',
    batchNo: 'BATCH20240107002',
    quantity: 200,
    remainingQuantity: 195,
    productionDate: '2023-12-20',
    expiryDate: '2024-12-20',
    supplier: '戴森中国',
    purchasePrice: 3999.00,
    status: 'active',
    warehouse: '西南仓',
    location: 'C区-03-05',
    inTime: '2024-01-07 14:00:00',
    lastOutTime: '2024-01-10 09:30:00'
  }
]
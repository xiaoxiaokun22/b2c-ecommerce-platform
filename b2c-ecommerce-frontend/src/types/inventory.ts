// 库存管理相关类型定义

// 库存记录
export interface InventoryRecord {
  id: string
  productId: string
  skuId: string
  warehouseId: string
  warehouseName: string
  quantity: number
  availableQuantity: number  // 可用库存
  lockedQuantity: number     // 锁定库存（预占）
  minStock: number          // 最低库存预警
  maxStock: number          // 最高库存上限
  status: 'normal' | 'locked' | 'out_of_stock' | 'discontinued'
  lastUpdated: string
  updatedBy: string
  updatedAt: string
  createdAt: string
}

// 库存变动记录
export interface InventoryMovement {
  id: string
  productId: string
  skuId: string
  warehouseId: string
  movementType: MovementType
  quantity: number
  beforeQuantity: number
  afterQuantity: number
  referenceType: 'order' | 'purchase' | 'adjustment' | 'return' | 'loss' | 'transfer'
  referenceId: string
  referenceNo: string
  reason: string
  operatorId: string
  operatorName: string
  createdAt: string
}

// 库存变动类型
export enum MovementType {
  IN = 'in',         // 入库
  OUT = 'out',       // 出库
  LOCK = 'lock',     // 锁定
  UNLOCK = 'unlock', // 解锁
  ADJUST = 'adjust'  // 调整
}

// 仓库信息
export interface Warehouse {
  id: string
  code: string
  name: string
  type: 'main' | 'branch' | 'virtual'
  address: string
  manager: string
  contact: string
  status: 'active' | 'inactive'
  sort: number
  createdAt: string
  updatedAt: string
}

// 库存预警
export interface StockAlert {
  id: string
  productId: string
  skuId: string
  warehouseId: string
  alertType: 'low_stock' | 'out_of_stock' | 'overstock'
  currentQuantity: number
  threshold: number
  alertLevel: 'warning' | 'critical'
  status: 'active' | 'resolved' | 'ignored'
  resolvedAt?: string
  resolvedBy?: string
  createdAt: string
}

// 库存盘点
export interface StockCheck {
  id: string
  checkNo: string
  warehouseId: string
  warehouseName: string
  status: 'draft' | 'checking' | 'completed' | 'cancelled'
  checkType: 'full' | 'partial' | 'cycle'
  scheduledDate: string
  startedAt?: string
  completedAt?: string
  checkerId?: string
  checkerName?: string
  itemCount: number
  checkedCount: number
  differenceCount: number
  totalDifference: number
  remark?: string
  items: StockCheckItem[]
  createdAt: string
  updatedAt: string
}

// 盘点明细
export interface StockCheckItem {
  id: string
  productId: string
  skuId: string
  productName: string
  skuName: string
  systemQuantity: number
  actualQuantity: number
  difference: number
  differenceReason?: string
  checkerId?: string
  checkerName?: string
  checkedAt?: string
}

// 库存查询参数
export interface InventoryQueryParams {
  page?: number
  size?: number
  productId?: string
  skuId?: string
  warehouseId?: string
  status?: string
  lowStock?: boolean
  outOfStock?: boolean
  warehouseType?: string
}

// 库存变动查询参数
export interface MovementQueryParams {
  page?: number
  size?: number
  productId?: string
  skuId?: string
  warehouseId?: string
  movementType?: MovementType
  referenceType?: string
  referenceId?: string
  startTime?: string
  endTime?: string
  operatorId?: string
}

// 库存统计
export interface InventoryStatistics {
  totalProducts: number
  totalSkus: number
  totalQuantity: number
  totalValue: number
  lowStockProducts: number
  outOfStockProducts: number
  warehouseStats: WarehouseStats[]
  movementStats: MovementStats[]
}

// 仓库统计
export interface WarehouseStats {
  warehouseId: string
  warehouseName: string
  productCount: number
  skuCount: number
  totalQuantity: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
}

// 变动统计
export interface MovementStats {
  date: string
  inQuantity: number
  outQuantity: number
  inValue: number
  outValue: number
  netChange: number
}
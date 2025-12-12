import { api } from '@/utils/request'
import { BaseApiService } from './base'
import type {
  InventoryRecord,
  InventoryMovement,
  Warehouse,
  StockAlert,
  StockCheck,
  InventoryQueryParams,
  MovementQueryParams,
  InventoryStatistics
} from '@/types/inventory'
import type { ApiResponse, PaginatedResponse } from '@/api/common'

// 库存管理API
export class InventoryApiService extends BaseApiService<InventoryRecord, any, any, InventoryQueryParams> {
  protected baseUrl = '/inventory'

  // 获取库存详情（包含商品信息）
  async getDetailWithProduct(skuId: string, warehouseId?: string): Promise<ApiResponse<InventoryRecord & { productName: string; skuName: string }>> {
    const params = warehouseId ? { warehouseId } : {}
    return api.get(`${this.baseUrl}/detail/${skuId}`, params)
  }

  // 锁定库存（下单时使用）
  async lockStock(data: {
    orderId: string
    items: Array<{
      skuId: string
      quantity: number
      warehouseId?: string
    }>
  }): Promise<ApiResponse<void>> {
    return api.post(`${this.baseUrl}/lock`, data)
  }

  // 解锁库存（取消订单时使用）
  async unlockStock(orderId: string): Promise<ApiResponse<void>> {
    return api.post(`${this.baseUrl}/unlock/${orderId}`)
  }

  // 扣减库存（确认订单时使用）
  async deductStock(data: {
    orderId: string
    items: Array<{
      skuId: string
      quantity: number
      warehouseId?: string
    }>
  }): Promise<ApiResponse<void>> {
    return api.post(`${this.baseUrl}/deduct`, data)
  }

  // 增加库存（入库、退货等）
  async addStock(data: {
    type: 'purchase' | 'return' | 'adjustment' | 'transfer'
    items: Array<{
      skuId: string
      quantity: number
      warehouseId?: string
      reason: string
    }>
  }): Promise<ApiResponse<void>> {
    return api.post(`${this.baseUrl}/add`, data)
  }

  // 调整库存
  async adjustStock(data: {
    skuId: string
    warehouseId: string
    adjustType: 'set' | 'increase' | 'decrease'
    quantity: number
    reason: string
  }): Promise<ApiResponse<void>> {
    return api.post(`${this.baseUrl}/adjust`, data)
  }

  // 获取库存变动记录
  getMovements(params: MovementQueryParams): Promise<ApiResponse<PaginatedResponse<InventoryMovement>>> {
    return api.get(`${this.baseUrl}/movements`, params)
  }

  // 获取库存统计
  getStatistics(params?: {
    warehouseId?: string
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<InventoryStatistics>> {
    return api.get(`${this.baseUrl}/statistics`, params)
  }

  // 批量更新最低库存
  async batchUpdateMinStock(data: Array<{
    skuId: string
    warehouseId: string
    minStock: number
  }>): Promise<ApiResponse<void>> {
    return api.patch(`${this.baseUrl}/batch/min-stock`, data)
  }
}

// 仓库管理API
export class WarehouseApiService extends BaseApiService<Warehouse, any, any> {
  protected baseUrl = '/inventory/warehouses'

  // 获取所有仓库列表（不分页）
  async getAll(): Promise<ApiResponse<Warehouse[]>> {
    return api.get(`${this.baseUrl}/all`)
  }

  // 获取仓库库存汇总
  async getWarehouseStockSummary(warehouseId: string): Promise<ApiResponse<{
    totalProducts: number
    totalSkus: number
    totalQuantity: number
    totalValue: number
    lowStockCount: number
    outOfStockCount: number
  }>> {
    return api.get(`${this.baseUrl}/${warehouseId}/summary`)
  }
}

// 库存预警API
export class StockAlertApiService {
  // 获取预警列表
  async getAlerts(params: {
    page?: number
    size?: number
    warehouseId?: string
    alertType?: string
    alertLevel?: string
    status?: string
  }): Promise<ApiResponse<PaginatedResponse<StockAlert>>> {
    return api.get('/inventory/alerts', params)
  }

  // 标记预警为已解决
  async resolveAlert(alertId: string, note?: string): Promise<ApiResponse<void>> {
    return api.patch(`/inventory/alerts/${alertId}/resolve`, { note })
  }

  // 忽略预警
  async ignoreAlert(alertId: string, note?: string): Promise<ApiResponse<void>> {
    return api.patch(`/inventory/alerts/${alertId}/ignore`, { note })
  }

  // 批量解决预警
  async batchResolveAlerts(alertIds: string[], note?: string): Promise<ApiResponse<void>> {
    return api.patch('/inventory/alerts/batch/resolve', { alertIds, note })
  }
}

// 库存盘点API
export class StockCheckApiService extends BaseApiService<StockCheck, any, any> {
  protected baseUrl = '/inventory/checks'

  // 创建盘点单
  async createCheck(data: {
    warehouseId: string
    checkType: 'full' | 'partial' | 'cycle'
    skuIds?: string[]
    scheduledDate: string
    remark?: string
  }): Promise<ApiResponse<StockCheck>> {
    return api.post(`${this.baseUrl}`, data)
  }

  // 开始盘点
  async startCheck(checkId: string): Promise<ApiResponse<void>> {
    return api.post(`${this.baseUrl}/${checkId}/start`)
  }

  // 完成盘点
  async completeCheck(checkId: string, data: {
    items: Array<{
      skuId: string
      actualQuantity: number
      differenceReason?: string
    }>
  }): Promise<ApiResponse<void>> {
    return api.post(`${this.baseUrl}/${checkId}/complete`, data)
  }

  // 取消盘点
  async cancelCheck(checkId: string, reason?: string): Promise<ApiResponse<void>> {
    return api.post(`${this.baseUrl}/${checkId}/cancel`, { reason })
  }

  // 获取盘点明细
  async getCheckItems(checkId: string): Promise<ApiResponse<Array<{
    skuId: string
    productName: string
    skuName: string
    systemQuantity: number
    actualQuantity?: number
    difference?: number
  }>>> {
    return api.get(`${this.baseUrl}/${checkId}/items`)
  }

  // 更新盘点项
  async updateCheckItem(checkId: string, itemId: string, data: {
    actualQuantity: number
    differenceReason?: string
  }): Promise<ApiResponse<void>> {
    return api.patch(`${this.baseUrl}/${checkId}/items/${itemId}`, data)
  }
}

// 导出实例
export const inventoryApi = new InventoryApiService()
export const warehouseApi = new WarehouseApiService()
export const stockAlertApi = new StockAlertApiService()
export const stockCheckApi = new StockCheckApiService()

// 默认导出
export default {
  inventory: inventoryApi,
  warehouse: warehouseApi,
  stockAlert: stockAlertApi,
  stockCheck: stockCheckApi
}
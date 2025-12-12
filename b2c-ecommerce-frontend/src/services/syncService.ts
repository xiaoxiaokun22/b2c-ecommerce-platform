import { inventoryApi } from '@/api/inventory'
import { productApi } from '@/api/product'
import { orderApi } from '@/api/order'
import type { InventoryRecord } from '@/types/inventory'
import type { Product, ProductSku } from '@/api/product'
import type { Order, OrderItem } from '@/types/order'

// 同步服务 - 解决数据一致性问题
export class SyncService {
  /**
   * 订单创建时的库存检查和锁定
   */
  async lockStockForOrder(orderItems: Array<{
    skuId: string
    quantity: number
    warehouseId?: string
  }>): Promise<{
    success: boolean
    availableItems: Array<{
      skuId: string
      availableQuantity: number
    }>
    insufficientItems: Array<{
      skuId: string
      requestQuantity: number
      availableQuantity: number
    }>
  }> {
    try {
      // 检查每个SKU的库存
      const availableItems: any[] = []
      const insufficientItems: any[] = []

      for (const item of orderItems) {
        // 获取库存信息
        const inventoryResponse = await inventoryApi.getDetailWithProduct(item.skuId, item.warehouseId)
        const inventory = inventoryResponse.data

        if (inventory.availableQuantity >= item.quantity) {
          availableItems.push({
            skuId: item.skuId,
            availableQuantity: inventory.availableQuantity
          })
        } else {
          insufficientItems.push({
            skuId: item.skuId,
            requestQuantity: item.quantity,
            availableQuantity: inventory.availableQuantity
          })
        }
      }

      // 如果所有商品库存充足，则锁定库存
      if (insufficientItems.length === 0) {
        await inventoryApi.lockStock({
          orderId: '', // 待订单创建后传入
          items: orderItems
        })
      }

      return {
        success: insufficientItems.length === 0,
        availableItems,
        insufficientItems
      }
    } catch (error) {
      console.error('库存检查失败:', error)
      throw error
    }
  }

  /**
   * 订单支付成功后扣减库存
   */
  async deductStockAfterOrder(orderId: string, orderItems: OrderItem[]): Promise<void> {
    try {
      await inventoryApi.deductStock({
        orderId,
        items: orderItems.map(item => ({
          skuId: item.skuId,
          quantity: item.quantity
        }))
      })
    } catch (error) {
      console.error('库存扣减失败:', error)
      throw error
    }
  }

  /**
   * 订单取消时解锁库存
   */
  async unlockStockOnCancel(orderId: string): Promise<void> {
    try {
      await inventoryApi.unlockStock(orderId)
    } catch (error) {
      console.error('解锁库存失败:', error)
      throw error
    }
  }

  /**
   * 退款退货时增加库存
   */
  async addStockOnReturn(data: {
    orderId: string
    items: Array<{
      skuId: string
      quantity: number
      warehouseId?: string
    }>
    reason: string
  }): Promise<void> {
    try {
      await inventoryApi.addStock({
        type: 'return',
        items: data.items.map(item => ({
          ...item,
          reason: data.reason
        }))
      })
    } catch (error) {
      console.error('退货入库失败:', error)
      throw error
    }
  }

  /**
   * 同步商品价格和库存到订单
   */
  async syncProductToOrder(orderId: string): Promise<void> {
    try {
      // 获取订单详情
      const orderResponse = await orderApi.getOrderDetail(parseInt(orderId))
      const order = orderResponse.data

      // 验证每个订单项的商品信息
      for (const item of order.items) {
        // 获取最新的商品和SKU信息
        const productResponse = await productApi.getProduct(item.productId)
        const product = productResponse.data

        // 找到对应的SKU
        const sku = product.skus.find(s => s.id === item.skuId)
        if (!sku) {
          throw new Error(`SKU ${item.skuId} 不存在`)
        }

        // 检查价格是否变化
        if (sku.price !== item.price) {
          console.warn(`SKU ${item.skuId} 价格已变化: ${item.price} -> ${sku.price}`)
          // 可以选择记录价格变化或自动调整
        }

        // 检查库存
        const inventoryResponse = await inventoryApi.getDetailWithProduct(item.skuId)
        const inventory = inventoryResponse.data

        if (inventory.quantity < item.quantity) {
          console.warn(`SKU ${item.skuId} 库存不足: 需要 ${item.quantity}, 可用 ${inventory.quantity}`)
          // 可以选择继续处理或提示用户
        }
      }
    } catch (error) {
      console.error('同步商品信息到订单失败:', error)
      throw error
    }
  }

  /**
   * 定期同步任务
   */
  async performScheduledSync(): Promise<void> {
    try {
      console.log('开始执行定期同步任务...')

      // 1. 同步商品基础信息到相关系统
      await this.syncProductInfo()

      // 2. 检查并处理库存异常
      await this.checkInventoryConsistency()

      // 3. 同步订单状态
      await this.syncOrderStatus()

      console.log('定期同步任务完成')
    } catch (error) {
      console.error('定期同步任务失败:', error)
    }
  }

  /**
   * 同步商品信息
   */
  private async syncProductInfo(): Promise<void> {
    // 获取所有活跃商品
    const productsResponse = await productApi.getProducts({
      page: 1,
      size: 1000,
      status: 'active'
    })

    // 批量更新到相关系统（如搜索引擎、缓存等）
    // 这里可以根据实际需求实现
  }

  /**
   * 检查库存一致性
   */
  private async checkInventoryConsistency(): Promise<void> {
    // 获取库存预警
    const alertsResponse = await inventoryApi.getAlerts({
      status: 'active'
    })

    for (const alert of alertsResponse.data.items) {
      if (alert.alertType === 'out_of_stock') {
        // 自动下架相关商品
        await productApi.updateProductStatus(parseInt(alert.productId), 'inactive')
        console.log(`商品 ${alert.productId} 库存为0，已自动下架`)
      }
    }
  }

  /**
   * 同步订单状态
   */
  private async syncOrderStatus(): Promise<void> {
    // 检查超时未支付的订单
    // 检查发货超时的订单
    // 检查自动确认收货的订单
    // 这里可以根据业务规则实现
  }
}

// 创建单例实例
export const syncService = new SyncService()

export default syncService
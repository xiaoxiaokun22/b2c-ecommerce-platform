import { orderApi } from '@/api/order'
import { syncService } from './syncService'
import type { Order, OrderStatus } from '@/types/order'
import type { RefundRecord } from '@/types/refund'

// 订单状态枚举（规范化）
export enum StandardOrderStatus {
  PENDING_PAYMENT = 'pending_payment',    // 待支付
  PAID = 'paid',                          // 已支付
  PENDING_REVIEW = 'pending_review',      // 待审核
  REJECTED = 'rejected',                  // 已拒绝
  APPROVED = 'approved',                  // 已审核
  PENDING_SHIPMENT = 'pending_shipment',  // 待发货
  SHIPPED = 'shipped',                    // 已发货
  DELIVERED = 'delivered',                // 已送达
  COMPLETED = 'completed',                // 已完成
  CANCELLED = 'cancelled',                // 已取消
  REFUNDING = 'refunding',                // 退款中
  REFUNDED = 'refunded',                  // 已退款
  EXCEPTION = 'exception'                 // 异常
}

// 状态流转规则
export const StateTransitionRules: Record<StandardOrderStatus, StandardOrderStatus[]> = {
  [StandardOrderStatus.PENDING_PAYMENT]: [
    StandardOrderStatus.PAID,
    StandardOrderStatus.CANCELLED
  ],
  [StandardOrderStatus.PAID]: [
    StandardOrderStatus.PENDING_REVIEW,
    StandardOrderStatus.REFUNDING,
    StandardOrderStatus.CANCELLED
  ],
  [StandardOrderStatus.PENDING_REVIEW]: [
    StandardOrderStatus.APPROVED,
    StandardOrderStatus.REJECTED
  ],
  [StandardOrderStatus.REJECTED]: [
    StandardOrderStatus.REFUNDING
  ],
  [StandardOrderStatus.APPROVED]: [
    StandardOrderStatus.PENDING_SHIPMENT,
    StandardOrderStatus.REFUNDING
  ],
  [StandardOrderStatus.PENDING_SHIPMENT]: [
    StandardOrderStatus.SHIPPED
  ],
  [StandardOrderStatus.SHIPPED]: [
    StandardOrderStatus.DELIVERED,
    StandardOrderStatus.EXCEPTION
  ],
  [StandardOrderStatus.DELIVERED]: [
    StandardOrderStatus.COMPLETED,
    StandardOrderStatus.REFUNDING
  ],
  [StandardOrderStatus.COMPLETED]: [
    StandardOrderStatus.REFUNDING
  ],
  [StandardOrderStatus.CANCELLED]: [],
  [StandardOrderStatus.REFUNDING]: [
    StandardOrderStatus.REFUNDED
  ],
  [StandardOrderStatus.REFUNDED]: [],
  [StandardOrderStatus.EXCEPTION]: [
    StandardOrderStatus.SHIPPED,
    StandardOrderStatus.REFUNDING,
    StandardOrderStatus.CANCELLED
  ]
}

// 订单状态服务
export class OrderStateService {
  /**
   * 检查状态流转是否合法
   */
  canTransition(from: StandardOrderStatus, to: StandardOrderStatus): boolean {
    return StateTransitionRules[from]?.includes(to) || false
  }

  /**
   * 获取可流转的目标状态
   */
  getAvailableTransitions(currentStatus: StandardOrderStatus): StandardOrderStatus[] {
    return StateTransitionRules[currentStatus] || []
  }

  /**
   * 处理订单支付成功
   */
  async handlePaymentSuccess(orderId: string, paymentId: string): Promise<void> {
    try {
      // 1. 更新订单状态为已支付
      await this.updateOrderStatus(orderId, StandardOrderStatus.PAID)

      // 2. 扣减库存
      const orderResponse = await orderApi.getOrderDetail(parseInt(orderId))
      const order = orderResponse.data
      await syncService.deductStockAfterOrder(orderId, order.items)

      // 3. 记录操作日志
      await this.logOrderAction(orderId, 'payment_success', {
        paymentId,
        operator: 'system',
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('处理支付成功失败:', error)
      throw error
    }
  }

  /**
   * 处理订单审核
   */
  async handleOrderReview(orderId: string, approved: boolean, remark?: string): Promise<void> {
    try {
      const orderResponse = await orderApi.getOrderDetail(parseInt(orderId))
      const order = orderResponse.data

      if (order.status !== StandardOrderStatus.PENDING_REVIEW) {
        throw new Error('订单状态不是待审核')
      }

      const newStatus = approved ? StandardOrderStatus.APPROVED : StandardOrderStatus.REJECTED
      await this.updateOrderStatus(orderId, newStatus)

      // 如果拒绝，需要退款
      if (!approved) {
        await this.initiateRefund(orderId, {
          reason: remark || '订单审核拒绝',
          type: 'full',
          operator: 'system'
        })
      }

      // 记录审核日志
      await this.logOrderAction(orderId, 'review', {
        approved,
        remark,
        operator: 'system',
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('处理订单审核失败:', error)
      throw error
    }
  }

  /**
   * 处理订单发货
   */
  async handleOrderShipment(orderId: string, logisticsInfo: {
    companyCode: string
    companyName: string
    trackingNumber: string
  }): Promise<void> {
    try {
      // 1. 更新订单状态为已发货
      await this.updateOrderStatus(orderId, StandardOrderStatus.SHIPPED)

      // 2. 记录物流信息
      await orderApi.shipOrder(parseInt(orderId), logisticsInfo)

      // 3. 记录操作日志
      await this.logOrderAction(orderId, 'shipment', {
        logisticsInfo,
        operator: 'system',
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('处理订单发货失败:', error)
      throw error
    }
  }

  /**
   * 处理订单取消
   */
  async handleOrderCancel(orderId: string, reason: string): Promise<void> {
    try {
      const orderResponse = await orderApi.getOrderDetail(parseInt(orderId))
      const order = orderResponse.data

      // 1. 更新订单状态为已取消
      await this.updateOrderStatus(orderId, StandardOrderStatus.CANCELLED)

      // 2. 如果已支付，需要退款
      if ([StandardOrderStatus.PAID, StandardOrderStatus.APPROVED, StandardOrderStatus.PENDING_SHIPMENT].includes(order.status as StandardOrderStatus)) {
        await this.initiateRefund(orderId, {
          reason,
          type: 'full',
          operator: 'customer'
        })
      }

      // 3. 如果已扣减库存，需要回滚
      if ([StandardOrderStatus.PAID, StandardOrderStatus.APPROVED].includes(order.status as StandardOrderStatus)) {
        await syncService.unlockStockOnCancel(orderId)
      }

      // 4. 记录取消日志
      await this.logOrderAction(orderId, 'cancel', {
        reason,
        operator: 'customer',
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('处理订单取消失败:', error)
      throw error
    }
  }

  /**
   * 处理退款申请
   */
  async handleRefundApplication(orderId: string, refundData: {
    items: Array<{
      orderItemId: string
      quantity: number
      reason: string
    }>
    refundAmount: number
    refundType: 'full' | 'partial'
    reason: string
  }): Promise<void> {
    try {
      // 1. 更新订单状态为退款中
      await this.updateOrderStatus(orderId, StandardOrderStatus.REFUNDING)

      // 2. 创建退款记录
      // 这里需要调用退款API创建退款记录

      // 3. 如果是退货退款，需要等待用户退货
      if (refundData.refundType === 'partial' || refundData.items.length > 0) {
        // 发送退货地址和说明
      }

      // 4. 记录退款申请日志
      await this.logOrderAction(orderId, 'refund_application', {
        refundData,
        operator: 'customer',
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('处理退款申请失败:', error)
      throw error
    }
  }

  /**
   * 处理退款完成
   */
  async handleRefundComplete(orderId: string, refundId: string): Promise<void> {
    try {
      // 1. 检查退款是否全额退款
      const orderResponse = await orderApi.getOrderDetail(parseInt(orderId))
      const order = orderResponse.data

      // 2. 如果是全额退款，更新订单状态为已退款
      // 3. 如果是部分退款，保持订单完成状态

      // 4. 记录退款完成日志
      await this.logOrderAction(orderId, 'refund_complete', {
        refundId,
        operator: 'system',
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('处理退款完成失败:', error)
      throw error
    }
  }

  /**
   * 更新订单状态
   */
  private async updateOrderStatus(orderId: string, newStatus: StandardOrderStatus): Promise<void> {
    // 这里需要调用订单API更新状态
    // 实际实现可能需要根据具体的API调整
    console.log(`更新订单 ${orderId} 状态为: ${newStatus}`)
  }

  /**
   * 发起退款
   */
  private async initiateRefund(orderId: string, data: {
    reason: string
    type: 'full' | 'partial'
    operator: string
  }): Promise<void> {
    // 这里需要调用退款API
    console.log(`为订单 ${orderId} 发起退款`, data)
  }

  /**
   * 记录订单操作日志
   */
  private async logOrderAction(orderId: string, action: string, details: any): Promise<void> {
    // 这里需要调用日志API记录操作
    console.log(`记录订单操作日志`, { orderId, action, details })
  }
}

// 创建单例实例
export const orderStateService = new OrderStateService()

export default orderStateService
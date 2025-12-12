// 支付状态同步服务 - 解决订单模块和支付模块的状态同步问题

import { orderApi } from '@/api/order'
import { paymentApi } from '@/api/payment'
import { orderStateService, StandardOrderStatus } from './orderStateService'
import { logOperation, OperationType } from './permissionService'
import { ElMessage } from 'element-plus'

// 支付状态枚举（标准化）
export enum StandardPaymentStatus {
  PENDING = 'pending',         // 待支付
  PROCESSING = 'processing',   // 处理中
  SUCCESS = 'success',         // 支付成功
  FAILED = 'failed',          // 支付失败
  CANCELLED = 'cancelled',     // 已取消
  REFUNDING = 'refunding',     // 退款中
  REFUNDED = 'refunded',       // 已退款
  TIMEOUT = 'timeout'         // 支付超时
}

// 订单支付状态映射
const OrderPaymentStatusMap: Record<StandardOrderStatus, StandardPaymentStatus> = {
  [StandardOrderStatus.PENDING_PAYMENT]: StandardPaymentStatus.PENDING,
  [StandardOrderStatus.PAID]: StandardPaymentStatus.SUCCESS,
  [StandardOrderStatus.PENDING_REVIEW]: StandardPaymentStatus.SUCCESS,
  [StandardOrderStatus.APPROVED]: StandardPaymentStatus.SUCCESS,
  [StandardOrderStatus.REJECTED]: StandardPaymentStatus.REFUNDING,
  [StandardOrderStatus.PENDING_SHIPMENT]: StandardPaymentStatus.SUCCESS,
  [StandardOrderStatus.SHIPPED]: StandardPaymentStatus.SUCCESS,
  [StandardOrderStatus.DELIVERED]: StandardPaymentStatus.SUCCESS,
  [StandardOrderStatus.COMPLETED]: StandardPaymentStatus.SUCCESS,
  [StandardOrderStatus.CANCELLED]: StandardPaymentStatus.CANCELLED,
  [StandardOrderStatus.REFUNDING]: StandardPaymentStatus.REFUNDING,
  [StandardOrderStatus.REFUNDED]: StandardPaymentStatus.REFUNDED,
  [StandardOrderStatus.EXCEPTION]: StandardPaymentStatus.FAILED
}

// 支付订单状态映射
const PaymentOrderStatusMap: Record<StandardPaymentStatus, StandardOrderStatus> = {
  [StandardPaymentStatus.PENDING]: StandardOrderStatus.PENDING_PAYMENT,
  [StandardPaymentStatus.PROCESSING]: StandardOrderStatus.PENDING_PAYMENT,
  [StandardPaymentStatus.SUCCESS]: StandardOrderStatus.PAID,
  [StandardPaymentStatus.FAILED]: StandardOrderStatus.PENDING_PAYMENT, // 支付失败，订单仍待支付
  [StandardPaymentStatus.CANCELLED]: StandardOrderStatus.CANCELLED,
  [StandardPaymentStatus.REFUNDING]: StandardOrderStatus.REFUNDING,
  [StandardPaymentStatus.REFUNDED]: StandardOrderStatus.REFUNDED,
  [StandardPaymentStatus.TIMEOUT]: StandardOrderStatus.CANCELLED
}

// 支付记录
export interface PaymentRecord {
  id: string
  orderId: string
  orderNo: string
  paymentChannel: string
  paymentMethod: string
  amount: number
  currency: string
  status: StandardPaymentStatus
  transactionId?: string
  thirdPartyTransactionId?: string
  paymentTime?: string
  failureReason?: string
  refundAmount?: number
  refundTime?: string
  createdAt: string
  updatedAt: string
}

// 支付同步记录
export interface PaymentSyncRecord {
  id: string
  orderId: string
  paymentId: string
  orderStatus: StandardOrderStatus
  paymentStatus: StandardPaymentStatus
  syncType: 'order_to_payment' | 'payment_to_order' | 'auto_check'
  conflict?: boolean
  conflictReason?: string
  resolved: boolean
  resolvedAt?: string
  syncedAt: string
}

// 支付状态同步服务
export class PaymentSyncService {
  private static instance: PaymentSyncService
  private syncQueue: PaymentSyncRecord[] = []
  private isProcessing = false

  private constructor() {
    this.initPeriodicCheck()
  }

  static getInstance(): PaymentSyncService {
    if (!PaymentSyncService.instance) {
      PaymentSyncService.instance = new PaymentSyncService()
    }
    return PaymentSyncService.instance
  }

  /**
   * 初始化定期检查
   */
  private initPeriodicCheck(): void {
    // 每5分钟检查一次支付状态同步
    setInterval(() => {
      this.checkPaymentStatus()
    }, 5 * 60 * 1000)
  }

  /**
   * 处理支付成功
   */
  async handlePaymentSuccess(paymentId: string, transactionId?: string): Promise<void> {
    try {
      // 1. 获取支付记录
      const payment = await this.getPaymentRecord(paymentId)
      if (!payment) {
        throw new Error('支付记录不存在')
      }

      // 2. 更新支付状态
      await this.updatePaymentStatus(paymentId, StandardPaymentStatus.SUCCESS, {
        transactionId,
        paymentTime: new Date().toISOString()
      })

      // 3. 同步订单状态
      await this.syncPaymentToOrder(payment.orderId, StandardPaymentStatus.SUCCESS)

      // 4. 记录同步日志
      await this.logSync({
        orderId: payment.orderId,
        paymentId,
        syncType: 'payment_to_order',
        orderStatus: PaymentOrderStatusMap[StandardPaymentStatus.SUCCESS],
        paymentStatus: StandardPaymentStatus.SUCCESS
      })

      // 5. 记录操作日志
      await logOperation({
        type: OperationType.APPROVE,
        module: 'payment',
        operation: '支付成功处理',
        targetId: paymentId,
        targetName: `订单 ${payment.orderNo} 支付`,
        data: { transactionId }
      })

      console.log(`支付成功处理完成: ${paymentId}`)
    } catch (error) {
      console.error('处理支付成功失败:', error)
      throw error
    }
  }

  /**
   * 处理支付失败
   */
  async handlePaymentFailure(paymentId: string, reason: string): Promise<void> {
    try {
      // 1. 获取支付记录
      const payment = await this.getPaymentRecord(paymentId)
      if (!payment) {
        throw new Error('支付记录不存在')
      }

      // 2. 更新支付状态
      await this.updatePaymentStatus(paymentId, StandardPaymentStatus.FAILED, {
        failureReason: reason
      })

      // 3. 同步订单状态（保持待支付状态）
      await this.syncPaymentToOrder(payment.orderId, StandardPaymentStatus.FAILED)

      // 4. 记录同步日志
      await this.logSync({
        orderId: payment.orderId,
        paymentId,
        syncType: 'payment_to_order',
        orderStatus: PaymentOrderStatusMap[StandardPaymentStatus.FAILED],
        paymentStatus: StandardPaymentStatus.FAILED,
        conflict: false
      })

      // 5. 记录操作日志
      await logOperation({
        type: OperationType.REJECT,
        module: 'payment',
        operation: '支付失败处理',
        targetId: paymentId,
        targetName: `订单 ${payment.orderNo} 支付`,
        data: { reason }
      })

      console.log(`支付失败处理完成: ${paymentId}`)
    } catch (error) {
      console.error('处理支付失败失败:', error)
      throw error
    }
  }

  /**
   * 处理退款
   */
  async handleRefund(paymentId: string, refundAmount: number, reason?: string): Promise<void> {
    try {
      // 1. 获取支付记录
      const payment = await this.getPaymentRecord(paymentId)
      if (!payment) {
        throw new Error('支付记录不存在')
      }

      // 2. 检查退款金额
      if (refundAmount > payment.amount) {
        throw new Error('退款金额不能大于支付金额')
      }

      // 3. 更新支付状态
      const newStatus = refundAmount >= payment.amount ?
        StandardPaymentStatus.REFUNDED : StandardPaymentStatus.REFUNDING
      await this.updatePaymentStatus(paymentId, newStatus, {
        refundAmount,
        refundTime: new Date().toISOString()
      })

      // 4. 同步订单状态
      await this.syncPaymentToOrder(payment.orderId, newStatus)

      // 5. 记录同步日志
      await this.logSync({
        orderId: payment.orderId,
        paymentId,
        syncType: 'payment_to_order',
        orderStatus: PaymentOrderStatusMap[newStatus],
        paymentStatus: newStatus
      })

      // 6. 记录操作日志
      await logOperation({
        type: OperationType.REFUND,
        module: 'payment',
        operation: '退款处理',
        targetId: paymentId,
        targetName: `订单 ${payment.orderNo} 退款`,
        data: { refundAmount, reason }
      })

      console.log(`退款处理完成: ${paymentId}`)
    } catch (error) {
      console.error('处理退款失败:', error)
      throw error
    }
  }

  /**
   * 同步订单状态到支付模块
   */
  async syncOrderToPayment(orderId: string): Promise<void> {
    try {
      // 1. 获取订单信息
      const orderResponse = await orderApi.getOrderDetail(parseInt(orderId))
      const order = orderResponse.data

      // 2. 获取或创建支付记录
      let payment = await this.getPaymentByOrderId(orderId)
      if (!payment) {
        payment = await this.createPaymentRecord(order)
      }

      // 3. 根据订单状态确定支付状态
      const expectedPaymentStatus = OrderPaymentStatusMap[order.status as StandardOrderStatus]

      // 4. 检查是否需要更新
      if (payment.status !== expectedPaymentStatus) {
        // 记录冲突
        const hasConflict = this.detectStatusConflict(payment.status, expectedPaymentStatus)

        if (hasConflict) {
          await this.handleStatusConflict(payment, expectedPaymentStatus)
        } else {
          await this.updatePaymentStatus(payment.id, expectedPaymentStatus)
        }

        // 5. 记录同步日志
        await this.logSync({
          orderId,
          paymentId: payment.id,
          syncType: 'order_to_payment',
          orderStatus: order.status as StandardOrderStatus,
          paymentStatus: expectedPaymentStatus,
          conflict: hasConflict
        })
      }

      console.log(`订单到支付状态同步完成: ${orderId}`)
    } catch (error) {
      console.error('订单到支付状态同步失败:', error)
      throw error
    }
  }

  /**
   * 同步支付状态到订单模块
   */
  async syncPaymentToOrder(orderId: string, paymentStatus: StandardPaymentStatus): Promise<void> {
    try {
      // 1. 确定订单状态
      const expectedOrderStatus = PaymentOrderStatusMap[paymentStatus]

      // 2. 更新订单状态
      await orderStateService.updateOrderStatus(orderId, expectedOrderStatus)

      // 3. 处理特殊业务逻辑
      if (paymentStatus === StandardPaymentStatus.SUCCESS) {
        // 支付成功后的处理
        await orderStateService.handlePaymentSuccess(orderId, '')
      }

      console.log(`支付到订单状态同步完成: ${orderId}`)
    } catch (error) {
      console.error('支付到订单状态同步失败:', error)
      throw error
    }
  }

  /**
   * 定期检查支付状态
   */
  private async checkPaymentStatus(): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true
    try {
      // 1. 获取所有待支付的订单
      const pendingOrders = await this.getPendingPaymentOrders()

      // 2. 检查每个订单的支付状态
      for (const order of pendingOrders) {
        const payment = await this.getPaymentByOrderId(order.id)
        if (payment) {
          // 检查支付超时
          const now = new Date()
          const orderTime = new Date(order.createdAt)
          const timeoutMinutes = 30 // 30分钟支付超时

          if ((now.getTime() - orderTime.getTime()) > timeoutMinutes * 60 * 1000) {
            await this.handlePaymentTimeout(payment.id)
          }
        }
      }

      // 3. 检查处理中的支付
      const processingPayments = await this.getProcessingPayments()
      for (const payment of processingPayments) {
        // 查询第三方支付状态
        await this.queryThirdPartyPaymentStatus(payment.id)
      }
    } catch (error) {
      console.error('定期检查支付状态失败:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 处理支付超时
   */
  private async handlePaymentTimeout(paymentId: string): Promise<void> {
    try {
      const payment = await this.getPaymentRecord(paymentId)
      if (!payment) return

      // 更新支付状态为超时
      await this.updatePaymentStatus(paymentId, StandardPaymentStatus.TIMEOUT)

      // 同步订单状态为已取消
      await this.syncPaymentToOrder(payment.orderId, StandardPaymentStatus.TIMEOUT)

      // 记录日志
      await logOperation({
        type: OperationType.CANCEL,
        module: 'payment',
        operation: '支付超时处理',
        targetId: paymentId,
        targetName: `订单 ${payment.orderNo} 支付超时`
      })

      console.log(`支付超时处理完成: ${paymentId}`)
    } catch (error) {
      console.error('处理支付超时失败:', error)
    }
  }

  /**
   * 查询第三方支付状态
   */
  private async queryThirdPartyPaymentStatus(paymentId: string): Promise<void> {
    try {
      const payment = await this.getPaymentRecord(paymentId)
      if (!payment || !payment.thirdPartyTransactionId) return

      // TODO: 调用第三方支付查询接口
      // const thirdPartyStatus = await thirdPartyApi.queryStatus(payment.thirdPartyTransactionId)

      // 根据查询结果更新本地状态
    } catch (error) {
      console.error('查询第三方支付状态失败:', error)
    }
  }

  /**
   * 检测状态冲突
   */
  private detectStatusConflict(currentStatus: StandardPaymentStatus, expectedStatus: StandardPaymentStatus): boolean {
    // 定义不可直接转换的状态对
    const invalidTransitions: Array<[StandardPaymentStatus, StandardPaymentStatus]> = [
      [StandardPaymentStatus.SUCCESS, StandardPaymentStatus.PENDING],
      [StandardPaymentStatus.REFUNDED, StandardPaymentStatus.SUCCESS],
      [StandardPaymentStatus.REFUNDED, StandardPaymentStatus.FAILED]
    ]

    return invalidTransitions.some(([from, to]) =>
      currentStatus === from && expectedStatus === to
    )
  }

  /**
   * 处理状态冲突
   */
  private async handleStatusConflict(payment: PaymentRecord, expectedStatus: StandardPaymentStatus): Promise<void> {
    // 记录冲突
    console.warn(`支付状态冲突: ${payment.id}, 当前状态: ${payment.status}, 期望状态: ${expectedStatus}`)

    // 根据业务规则处理冲突
    // 这里可以添加自定义的冲突解决逻辑

    // 默认不更新，保持当前状态
  }

  // 辅助方法（需要根据实际API实现）
  private async getPaymentRecord(paymentId: string): Promise<PaymentRecord | null> {
    // 调用支付API获取支付记录
    return null
  }

  private async getPaymentByOrderId(orderId: string): Promise<PaymentRecord | null> {
    // 调用支付API根据订单ID获取支付记录
    return null
  }

  private async createPaymentRecord(order: any): Promise<PaymentRecord> {
    // 创建支付记录
    return {} as PaymentRecord
  }

  private async updatePaymentStatus(paymentId: string, status: StandardPaymentStatus, data?: any): Promise<void> {
    // 更新支付状态
  }

  private async logSync(data: Omit<PaymentSyncRecord, 'id' | 'syncedAt' | 'resolved'>): Promise<void> {
    // 记录同步日志
  }

  private async getPendingPaymentOrders(): Promise<any[]> {
    // 获取待支付订单
    return []
  }

  private async getProcessingPayments(): Promise<PaymentRecord[]> {
    // 获取处理中的支付
    return []
  }
}

// 创建单例实例
export const paymentSyncService = PaymentSyncService.getInstance()

export default paymentSyncService
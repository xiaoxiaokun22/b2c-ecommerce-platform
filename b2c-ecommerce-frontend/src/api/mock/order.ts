// 订单模块Mock数据
import {
  OrderStatus,
  PaymentMethod,
  RefundStatus,
  AfterSaleType
} from '@/types/order'
import type {
  Order,
  OrderQueryParams,
  OrderStatistics,
  Refund,
  AfterSale,
  Logistics,
  LogisticsTrace,
  OrderApiResponse
} from '@/types/order'

// Mock订单数据
const generateMockOrders = (): Order[] => {
  const orders: Order[] = []
  const statusValues = Object.values(OrderStatus)
  const paymentMethods = Object.values(PaymentMethod)

  for (let i = 1; i <= 150; i++) {
    const status = statusValues[Math.floor(Math.random() * statusValues.length)]
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    const createTime = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)

    // 生成订单商品
    const items = []
    const itemCount = Math.floor(Math.random() * 3) + 1
    let totalAmount = 0

    for (let j = 1; j <= itemCount; j++) {
      const price = Math.floor(Math.random() * 5000) + 100
      const quantity = Math.floor(Math.random() * 3) + 1
      const totalPrice = price * quantity
      totalAmount += totalPrice

      items.push({
        id: i * 100 + j,
        orderId: i,
        productId: Math.floor(Math.random() * 50) + 1,
        productName: `商品${i}-${j}`,
        productImage: `https://picsum.photos/100/100?random=${i * 100 + j}`,
        skuId: j,
        skuName: `规格${j}`,
        skuPrice: price,
        quantity,
        totalPrice
      })
    }

    const discountAmount = Math.floor(Math.random() * 200)
    const shippingFee = totalAmount > 99 ? 0 : Math.floor(Math.random() * 20) + 5
    const actualAmount = totalAmount - discountAmount + shippingFee

    orders.push({
      id: i,
      orderNo: `ORD${String(i).padStart(8, '0')}`,
      userId: Math.floor(Math.random() * 100) + 1,
      userName: `用户${i}`,
      userPhone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      totalAmount,
      discountAmount,
      shippingFee,
      actualAmount,
      status,
      paymentMethod,
      paymentTime: status >= OrderStatus.PENDING_REVIEW ?
        new Date(createTime.getTime() + Math.random() * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19) : undefined,
      paymentNo: status >= OrderStatus.PENDING_REVIEW ? `PAY${String(i).padStart(12, '0')}` : undefined,
      address: {
        id: i,
        receiverName: `收货人${i}`,
        receiverPhone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        address: `科技园南区第${i}栋`,
        zipCode: '518000',
        isDefault: true
      },
      items,
      remark: Math.random() > 0.7 ? `用户备注${i}` : undefined,
      createTime: createTime.toISOString().replace('T', ' ').substring(0, 19),
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      payTime: status >= OrderStatus.PENDING_SHIPMENT ?
        new Date(createTime.getTime() + Math.random() * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19) : undefined,
      shipTime: status >= OrderStatus.SHIPPED ?
        new Date(createTime.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19) : undefined,
      receiveTime: status >= OrderStatus.DELIVERED ?
        new Date(createTime.getTime() + Math.random() * 48 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19) : undefined,
      completeTime: status === OrderStatus.COMPLETED ?
        new Date(createTime.getTime() + Math.random() * 72 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19) : undefined,
      cancelTime: status === OrderStatus.CANCELLED ?
        new Date(createTime.getTime() + Math.random() * 12 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19) : undefined
    })
  }

  return orders
}

// Mock物流数据
const generateMockLogistics = (): Record<number, Logistics> => {
  const logisticsMap: Record<number, Logistics> = {}

  for (let i = 1; i <= 50; i++) {
    const createTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    const traces: LogisticsTrace[] = [
      {
        time: createTime.toISOString().replace('T', ' ').substring(0, 19),
        status: '已揽收',
        description: '快递员已取件，包裹正在运输中'
      },
      {
        time: new Date(createTime.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
        status: '运输中',
        description: '包裹已到达配送中心'
      },
      {
        time: new Date(createTime.getTime() + Math.random() * 48 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
        status: '派送中',
        description: '快递员正在派送，请保持电话畅通'
      }
    ]

    logisticsMap[i] = {
      id: i,
      orderId: i,
      companyCode: `COMPANY${i}`,
      companyName: `快递公司${i}`,
      trackingNumber: `SF${String(i).padStart(12, '0')}`,
      status: 3,
      lastUpdate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      traces
    }
  }

  return logisticsMap
}

// Mock退款数据
const generateMockRefunds = (): Refund[] => {
  const refunds: Refund[] = []
  const statusValues = Object.values(RefundStatus)

  for (let i = 1; i <= 50; i++) {
    const status = statusValues[Math.floor(Math.random() * statusValues.length)]
    const applyTime = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)

    refunds.push({
      id: i,
      orderId: Math.floor(Math.random() * 100) + 1,
      orderNo: `ORD${String(Math.floor(Math.random() * 100) + 1).padStart(8, '0')}`,
      userId: Math.floor(Math.random() * 100) + 1,
      userName: `用户${i}`,
      refundAmount: Math.floor(Math.random() * 2000) + 100,
      reason: `退款原因${i}`,
      description: `详细描述${i}`,
      status,
      applyTime: applyTime.toISOString().replace('T', ' ').substring(0, 19),
      processTime: status !== RefundStatus.PENDING ?
        new Date(applyTime.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19) : undefined,
      completeTime: status === RefundStatus.COMPLETED ?
        new Date(applyTime.getTime() + Math.random() * 48 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19) : undefined,
      processor: status !== RefundStatus.PENDING ? `客服${i}` : undefined,
      remark: Math.random() > 0.7 ? `处理备注${i}` : undefined
    })
  }

  return refunds
}

// Mock售后服务数据
const generateMockAfterSales = (): AfterSale[] => {
  const afterSales: AfterSale[] = []
  const typeValues = Object.values(AfterSaleType)
  const statusValues = Object.values(RefundStatus)

  for (let i = 1; i <= 30; i++) {
    const type = typeValues[Math.floor(Math.random() * typeValues.length)]
    const status = statusValues[Math.floor(Math.random() * statusValues.length)]
    const applyTime = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)

    const images = []
    const imageCount = Math.floor(Math.random() * 3)
    for (let j = 1; j <= imageCount; j++) {
      images.push(`https://picsum.photos/200/200?random=${i * 10 + j}`)
    }

    afterSales.push({
      id: i,
      orderId: Math.floor(Math.random() * 100) + 1,
      orderNo: `ORD${String(Math.floor(Math.random() * 100) + 1).padStart(8, '0')}`,
      userId: Math.floor(Math.random() * 100) + 1,
      userName: `用户${i}`,
      type,
      reason: `售后原因${i}`,
      description: `详细描述${i}`,
      images: images.length > 0 ? images : undefined,
      status,
      applyTime: applyTime.toISOString().replace('T', ' ').substring(0, 19),
      processTime: status !== RefundStatus.PENDING ?
        new Date(applyTime.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19) : undefined,
      completeTime: status === RefundStatus.COMPLETED ?
        new Date(applyTime.getTime() + Math.random() * 48 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19) : undefined,
      processor: status !== RefundStatus.PENDING ? `客服${i}` : undefined,
      refundAmount: type !== AfterSaleType.EXCHANGE ? Math.floor(Math.random() * 2000) + 100 : undefined,
      remark: Math.random() > 0.7 ? `处理备注${i}` : undefined
    })
  }

  return afterSales
}

// 生成Mock数据
const mockOrders = generateMockOrders()
const mockLogistics = generateMockLogistics()
const mockRefunds = generateMockRefunds()
const mockAfterSales = generateMockAfterSales()

// 订单Mock API
export const orderMockApi = {
  // 获取订单列表
  getOrders: (params: OrderQueryParams): Promise<OrderApiResponse<{list: Order[], total: number}>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredOrders = [...mockOrders]

        // 按订单号筛选
        if (params.orderNo) {
          filteredOrders = filteredOrders.filter(order =>
            order.orderNo.includes(params.orderNo!)
          )
        }

        // 按用户名筛选
        if (params.userName) {
          filteredOrders = filteredOrders.filter(order =>
            order.userName.includes(params.userName!)
          )
        }

        // 按手机号筛选
        if (params.userPhone) {
          filteredOrders = filteredOrders.filter(order =>
            order.userPhone.includes(params.userPhone!)
          )
        }

        // 按状态筛选
        if (params.status !== undefined) {
          filteredOrders = filteredOrders.filter(order => order.status === params.status)
        }

        // 按支付方式筛选
        if (params.paymentMethod !== undefined) {
          filteredOrders = filteredOrders.filter(order => order.paymentMethod === params.paymentMethod)
        }

        // 按时间范围筛选
        if (params.startTime) {
          filteredOrders = filteredOrders.filter(order => order.createTime >= params.startTime!)
        }

        if (params.endTime) {
          filteredOrders = filteredOrders.filter(order => order.createTime <= params.endTime!)
        }

        // 按金额范围筛选
        if (params.minAmount !== undefined) {
          filteredOrders = filteredOrders.filter(order => order.actualAmount >= params.minAmount!)
        }

        if (params.maxAmount !== undefined) {
          filteredOrders = filteredOrders.filter(order => order.actualAmount <= params.maxAmount!)
        }

        // 排序（最新的在前面）
        filteredOrders.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())

        // 分页
        const page = params.page || 1
        const pageSize = params.pageSize || 20
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const paginatedOrders = filteredOrders.slice(start, end)

        resolve({
          code: 200,
          message: '获取成功',
          data: {
            list: paginatedOrders,
            total: filteredOrders.length
          }
        })
      }, 300)
    })
  },

  // 获取订单详情
  getOrderDetail: (orderId: number): Promise<OrderApiResponse<Order>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = mockOrders.find(o => o.id === orderId)
        if (order) {
          // 添加物流信息（如果订单已发货）
          if (order.status >= OrderStatus.SHIPPED && order.status !== OrderStatus.CANCELLED) {
            order.logistics = mockLogistics[orderId % 50 + 1]
          }

          resolve({
            code: 200,
            message: '获取成功',
            data: order
          })
        } else {
          reject(new Error('订单不存在'))
        }
      }, 200)
    })
  },

  // 订单审核
  auditOrder: (orderId: number, approved: boolean, remark?: string): Promise<OrderApiResponse<null>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = mockOrders.find(o => o.id === orderId)
        if (order) {
          if (order.status !== OrderStatus.PENDING_REVIEW) {
            reject(new Error('订单状态不正确'))
            return
          }

          order.status = approved ? OrderStatus.PENDING_SHIPMENT : OrderStatus.CANCELLED
          order.remark = remark
          order.updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19)

          resolve({
            code: 200,
            message: approved ? '审核通过' : '审核拒绝',
            data: null
          })
        } else {
          reject(new Error('订单不存在'))
        }
      }, 500)
    })
  },

  // 订单发货
  shipOrder: (orderId: number, logisticsInfo: {companyCode: string, companyName: string, trackingNumber: string}): Promise<OrderApiResponse<null>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = mockOrders.find(o => o.id === orderId)
        if (order) {
          if (order.status !== OrderStatus.PENDING_SHIPMENT) {
            reject(new Error('订单状态不正确'))
            return
          }

          order.status = OrderStatus.SHIPPED
          order.shipTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
          order.updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19)

          // 添加物流信息
          mockLogistics[orderId] = {
            id: orderId,
            orderId,
            companyCode: logisticsInfo.companyCode,
            companyName: logisticsInfo.companyName,
            trackingNumber: logisticsInfo.trackingNumber,
            status: 1,
            lastUpdate: new Date().toISOString().replace('T', ' ').substring(0, 19),
            traces: [
              {
                time: new Date().toISOString().replace('T', ' ').substring(0, 19),
                status: '已发货',
                description: '商品已发货，物流信息已更新'
              }
            ]
          }

          resolve({
            code: 200,
            message: '发货成功',
            data: null
          })
        } else {
          reject(new Error('订单不存在'))
        }
      }, 500)
    })
  },

  // 取消订单
  cancelOrder: (orderId: number, reason: string): Promise<OrderApiResponse<null>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = mockOrders.find(o => o.id === orderId)
        if (order) {
          if (order.status >= OrderStatus.SHIPPED) {
            reject(new Error('订单已发货，无法取消'))
            return
          }

          order.status = OrderStatus.CANCELLED
          order.cancelTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
          order.updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
          order.remark = reason

          resolve({
            code: 200,
            message: '取消成功',
            data: null
          })
        } else {
          reject(new Error('订单不存在'))
        }
      }, 500)
    })
  },

  // 获取退款列表
  getRefunds: (params: {page?: number, pageSize?: number, status?: RefundStatus}): Promise<OrderApiResponse<{list: Refund[], total: number}>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredRefunds = [...mockRefunds]

        if (params.status !== undefined) {
          filteredRefunds = filteredRefunds.filter(refund => refund.status === params.status)
        }

        // 排序（最新的在前面）
        filteredRefunds.sort((a, b) => new Date(b.applyTime).getTime() - new Date(a.applyTime).getTime())

        // 分页
        const page = params.page || 1
        const pageSize = params.pageSize || 20
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const paginatedRefunds = filteredRefunds.slice(start, end)

        resolve({
          code: 200,
          message: '获取成功',
          data: {
            list: paginatedRefunds,
            total: filteredRefunds.length
          }
        })
      }, 300)
    })
  },

  // 处理退款
  processRefund: (refundId: number, approved: boolean, remark?: string): Promise<OrderApiResponse<null>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const refund = mockRefunds.find(r => r.id === refundId)
        if (refund) {
          if (refund.status !== RefundStatus.PENDING) {
            reject(new Error('退款状态不正确'))
            return
          }

          refund.status = approved ? RefundStatus.APPROVED : RefundStatus.REJECTED
          refund.processTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
          refund.processor = '当前用户'
          refund.remark = remark

          resolve({
            code: 200,
            message: approved ? '退款已同意' : '退款已拒绝',
            data: null
          })
        } else {
          reject(new Error('退款申请不存在'))
        }
      }, 500)
    })
  },

  // 获取售后服务列表
  getAfterSales: (params: {page?: number, pageSize?: number, type?: AfterSaleType, status?: RefundStatus}): Promise<OrderApiResponse<{list: AfterSale[], total: number}>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredAfterSales = [...mockAfterSales]

        if (params.type !== undefined) {
          filteredAfterSales = filteredAfterSales.filter(afterSale => afterSale.type === params.type)
        }

        if (params.status !== undefined) {
          filteredAfterSales = filteredAfterSales.filter(afterSale => afterSale.status === params.status)
        }

        // 排序（最新的在前面）
        filteredAfterSales.sort((a, b) => new Date(b.applyTime).getTime() - new Date(a.applyTime).getTime())

        // 分页
        const page = params.page || 1
        const pageSize = params.pageSize || 20
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const paginatedAfterSales = filteredAfterSales.slice(start, end)

        resolve({
          code: 200,
          message: '获取成功',
          data: {
            list: paginatedAfterSales,
            total: filteredAfterSales.length
          }
        })
      }, 300)
    })
  },

  // 处理售后服务
  processAfterSale: (afterSaleId: number, approved: boolean, remark?: string): Promise<OrderApiResponse<null>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const afterSale = mockAfterSales.find(a => a.id === afterSaleId)
        if (afterSale) {
          if (afterSale.status !== RefundStatus.PENDING) {
            reject(new Error('售后服务状态不正确'))
            return
          }

          afterSale.status = approved ? RefundStatus.APPROVED : RefundStatus.REJECTED
          afterSale.processTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
          afterSale.processor = '当前用户'
          afterSale.remark = remark

          resolve({
            code: 200,
            message: approved ? '售后服务已同意' : '售后服务已拒绝',
            data: null
          })
        } else {
          reject(new Error('售后服务申请不存在'))
        }
      }, 500)
    })
  },

  // 获取订单统计
  getOrderStatistics: (): Promise<OrderApiResponse<OrderStatistics>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const todayStartTime = `${today} 00:00:00`
        const todayEndTime = `${today} 23:59:59`

        const todayOrders = mockOrders.filter(order =>
          order.createTime >= todayStartTime && order.createTime <= todayEndTime
        )

        const statusDistribution = Object.values(OrderStatus).map(status => ({
          status,
          count: mockOrders.filter(order => order.status === status).length,
          amount: mockOrders.filter(order => order.status === status)
            .reduce((sum, order) => sum + order.actualAmount, 0)
        }))

        const paymentMethodDistribution = Object.values(PaymentMethod).map(method => ({
          method,
          count: mockOrders.filter(order => order.paymentMethod === method).length,
          amount: mockOrders.filter(order => order.paymentMethod === method)
            .reduce((sum, order) => sum + order.actualAmount, 0)
        }))

        // 生成最近30天的趋势数据
        const dailyTrend = []
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const dateStr = date.toISOString().split('T')[0]
          const dayStartTime = `${dateStr} 00:00:00`
          const dayEndTime = `${dateStr} 23:59:59`

          const dayOrders = mockOrders.filter(order =>
            order.createTime >= dayStartTime && order.createTime <= dayEndTime
          )

          dailyTrend.push({
            date: dateStr,
            orderCount: dayOrders.length,
            amount: dayOrders.reduce((sum, order) => sum + order.actualAmount, 0)
          })
        }

        resolve({
          code: 200,
          message: '获取成功',
          data: {
            totalOrders: mockOrders.length,
            todayOrders: todayOrders.length,
            todayAmount: todayOrders.reduce((sum, order) => sum + order.actualAmount, 0),
            pendingPaymentCount: mockOrders.filter(order => order.status === OrderStatus.PENDING_PAYMENT).length,
            pendingShipmentCount: mockOrders.filter(order => order.status === OrderStatus.PENDING_SHIPMENT).length,
            exceptionCount: mockOrders.filter(order => order.status === OrderStatus.EXCEPTION).length,
            refundingCount: mockRefunds.filter(refund => refund.status === RefundStatus.PENDING).length,
            statusDistribution,
            paymentMethodDistribution,
            dailyTrend
          }
        })
      }, 500)
    })
  },

  // 标记订单为异常
  markOrderAsException: (orderId: number, reason: string): Promise<OrderApiResponse<null>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = mockOrders.find(o => o.id === orderId)
        if (order) {
          order.status = OrderStatus.EXCEPTION
          order.remark = reason
          order.updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19)

          resolve({
            code: 200,
            message: '已标记为异常订单',
            data: null
          })
        } else {
          reject(new Error('订单不存在'))
        }
      }, 500)
    })
  },

  // 处理异常订单
  handleExceptionOrder: (orderId: number, action: string, remark?: string): Promise<OrderApiResponse<null>> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = mockOrders.find(o => o.id === orderId)
        if (order) {
          if (order.status !== OrderStatus.EXCEPTION) {
            reject(new Error('订单状态不正确'))
            return
          }

          switch (action) {
            case 'resolve':
              order.status = OrderStatus.PENDING_SHIPMENT
              break
            case 'cancel':
              order.status = OrderStatus.CANCELLED
              order.cancelTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
              break
            case 'refund':
              order.status = OrderStatus.REFUNDED
              break
            default:
              reject(new Error('无效的操作'))
              return
          }

          order.remark = remark
          order.updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19)

          resolve({
            code: 200,
            message: '异常订单处理成功',
            data: null
          })
        } else {
          reject(new Error('订单不存在'))
        }
      }, 500)
    })
  }
}
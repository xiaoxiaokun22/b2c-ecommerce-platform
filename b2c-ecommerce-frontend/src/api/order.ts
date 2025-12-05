// 订单API接口
import request from './request'
import { orderMockApi } from './mock/order'
import type {
  Order,
  OrderQueryParams,
  OrderStatistics,
  Refund,
  AfterSale,
  RefundStatus,
  AfterSaleType,
  OrderApiResponse
} from '@/types/order'

// 订单API
export const orderApi = {
  // 获取订单列表
  getOrders: (params: OrderQueryParams): Promise<OrderApiResponse<{list: Order[], total: number}>> => {
    // 开发阶段使用Mock数据
    return orderMockApi.getOrders(params)

    // 生产环境API调用（暂时注释）
    // return request.get('/api/orders', { params })
  },

  // 获取订单详情
  getOrderDetail: (orderId: number): Promise<OrderApiResponse<Order>> => {
    // 开发阶段使用Mock数据
    return orderMockApi.getOrderDetail(orderId)

    // 生产环境API调用（暂时注释）
    // return request.get(`/api/orders/${orderId}`)
  },

  // 订单审核
  auditOrder: (orderId: number, approved: boolean, remark?: string): Promise<OrderApiResponse<null>> => {
    // 开发阶段使用Mock数据
    return orderMockApi.auditOrder(orderId, approved, remark)

    // 生产环境API调用（暂时注释）
    // return request.post(`/api/orders/${orderId}/audit`, { approved, remark })
  },

  // 订单发货
  shipOrder: (orderId: number, logisticsInfo: {companyCode: string, companyName: string, trackingNumber: string}): Promise<OrderApiResponse<null>> => {
    // 开发阶段使用Mock数据
    return orderMockApi.shipOrder(orderId, logisticsInfo)

    // 生产环境API调用（暂时注释）
    // return request.post(`/api/orders/${orderId}/ship`, logisticsInfo)
  },

  // 取消订单
  cancelOrder: (orderId: number, reason: string): Promise<OrderApiResponse<null>> => {
    // 开发阶段使用Mock数据
    return orderMockApi.cancelOrder(orderId, reason)

    // 生产环境API调用（暂时注释）
    // return request.post(`/api/orders/${orderId}/cancel`, { reason })
  },

  // 标记订单为异常
  markOrderAsException: (orderId: number, reason: string): Promise<OrderApiResponse<null>> => {
    // 开发阶段使用Mock数据
    return orderMockApi.markOrderAsException(orderId, reason)

    // 生产环境API调用（暂时注释）
    // return request.post(`/api/orders/${orderId}/exception`, { reason })
  },

  // 处理异常订单
  handleExceptionOrder: (orderId: number, action: string, remark?: string): Promise<OrderApiResponse<null>> => {
    // 开发阶段使用Mock数据
    return orderMockApi.handleExceptionOrder(orderId, action, remark)

    // 生产环境API调用（暂时注释）
    // return request.post(`/api/orders/${orderId}/handle-exception`, { action, remark })
  }
}

// 退款API
export const refundApi = {
  // 获取退款列表
  getRefunds: (params: {page?: number, pageSize?: number, status?: RefundStatus}): Promise<OrderApiResponse<{list: Refund[], total: number}>> => {
    // 开发阶段使用Mock数据
    return orderMockApi.getRefunds(params)

    // 生产环境API调用（暂时注释）
    // return request.get('/api/refunds', { params })
  },

  // 处理退款
  processRefund: (refundId: number, approved: boolean, remark?: string): Promise<OrderApiResponse<null>> => {
    // 开发阶段使用Mock数据
    return orderMockApi.processRefund(refundId, approved, remark)

    // 生产环境API调用（暂时注释）
    // return request.post(`/api/refunds/${refundId}/process`, { approved, remark })
  }
}

// 售后服务API
export const afterSaleApi = {
  // 获取售后服务列表
  getAfterSales: (params: {page?: number, pageSize?: number, type?: AfterSaleType, status?: RefundStatus}): Promise<OrderApiResponse<{list: AfterSale[], total: number}>> => {
    // 开发阶段使用Mock数据
    return orderMockApi.getAfterSales(params)

    // 生产环境API调用（暂时注释）
    // return request.get('/api/after-sales', { params })
  },

  // 处理售后服务
  processAfterSale: (afterSaleId: number, approved: boolean, remark?: string): Promise<OrderApiResponse<null>> => {
    // 开发阶段使用Mock数据
    return orderMockApi.processAfterSale(afterSaleId, approved, remark)

    // 生产环境API调用（暂时注释）
    // return request.post(`/api/after-sales/${afterSaleId}/process`, { approved, remark })
  }
}

// 统计API
export const statisticsApi = {
  // 获取订单统计
  getOrderStatistics: (): Promise<OrderApiResponse<OrderStatistics>> => {
    // 开发阶段使用Mock数据
    return orderMockApi.getOrderStatistics()

    // 生产环境API调用（暂时注释）
    // return request.get('/api/statistics/orders')
  }
}
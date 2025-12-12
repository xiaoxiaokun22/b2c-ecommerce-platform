import { api } from '@/utils/request'
import type { PaginationParams, PaginatedResponse, ApiResponse } from '@/api/common'

// 基础API服务类
export abstract class BaseApiService<T, TCreate, TUpdate = Partial<TCreate>, TQuery = PaginationParams> {
  protected abstract baseUrl: string

  // 获取列表
  async getList(params: TQuery & PaginationParams): Promise<ApiResponse<PaginatedResponse<T>>> {
    return api.get(this.baseUrl, params)
  }

  // 获取详情
  async getDetail(id: string | number): Promise<ApiResponse<T>> {
    return api.get(`${this.baseUrl}/${id}`)
  }

  // 创建
  async create(data: TCreate): Promise<ApiResponse<T>> {
    return api.post(this.baseUrl, data)
  }

  // 更新
  async update(id: string | number, data: TUpdate): Promise<ApiResponse<T>> {
    return api.put(`${this.baseUrl}/${id}`, data)
  }

  // 部分更新
  async patch(id: string | number, data: Partial<TUpdate>): Promise<ApiResponse<T>> {
    return api.patch(`${this.baseUrl}/${id}`, data)
  }

  // 删除
  async delete(id: string | number): Promise<ApiResponse<void>> {
    return api.delete(`${this.baseUrl}/${id}`)
  }

  // 批量删除
  async batchDelete(ids: (string | number)[]): Promise<ApiResponse<void>> {
    return api.delete(this.baseUrl, { data: { ids } })
  }

  // 更新状态
  async updateStatus(id: string | number, status: string): Promise<ApiResponse<void>> {
    return api.patch(`${this.baseUrl}/${id}/status`, { status })
  }

  // 批量更新状态
  async batchUpdateStatus(ids: (string | number)[], status: string): Promise<ApiResponse<void>> {
    return api.patch(`${this.baseUrl}/batch/status`, { ids, status })
  }
}

// 树形结构API服务类（用于分类等）
export abstract class TreeApiService<T, TCreate, TUpdate = Partial<TCreate>> extends BaseApiService<T, TCreate, TUpdate> {
  // 获取树形结构数据
  async getTree(params?: any): Promise<ApiResponse<T[]>> {
    return api.get(`${this.baseUrl}/tree`, params)
  }

  // 获取子节点
  async getChildren(parentId: string | number | null): Promise<ApiResponse<T[]>> {
    if (parentId === null) {
      return api.get(this.baseUrl, { parentId: null })
    }
    return api.get(this.baseUrl, { parentId })
  }
}
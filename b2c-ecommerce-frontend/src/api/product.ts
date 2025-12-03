import request from './request'

// 类型定义
export interface Product {
  id: number
  name: string
  categoryId: number
  categoryName: string
  brand: string
  mainImage: string
  images: string[]
  skuCount: number
  minPrice: number
  maxPrice: number
  totalStock: number
  sales: number
  status: 'active' | 'inactive' | 'draft'
  description?: string
  weight: number
  volume: number
  sort: number
  createdAt: string
  updatedAt: string
}

export interface ProductForm {
  id?: number
  name: string
  categoryId: number | null
  brand: string
  status: 'active' | 'inactive' | 'draft'
  description: string
  mainImage: string
  images: string[]
  specs: ProductSpec[]
  skus: ProductSku[]
  weight: number
  volume: number
  sort: number
}

export interface ProductSpec {
  id: string
  name: string
  values: string[]
}

export interface ProductSku {
  id: string
  specValues: string[]
  skuCode: string
  price: number
  marketPrice: number
  stock: number
  enabled: boolean
}

export interface ProductQuery {
  name?: string
  categoryId?: number | null
  status?: string
  brand?: string
  page: number
  size: number
}

export interface Category {
  id: number
  name: string
  parentId: number | null
  icon?: string
  sort: number
  status: 'active' | 'inactive'
  description?: string
  productCount: number
  createdAt: string
  children?: Category[]
  hasChildren?: boolean
}

export interface CategoryForm {
  id?: number
  parentId: number | null
  name: string
  icon?: string
  sort: number
  status: 'active' | 'inactive'
  description?: string
}

export interface ProductReview {
  id: number
  productId: number
  productName: string
  skuName: string
  productImage: string
  userId: number
  userNickname: string
  userPhone: string
  userAvatar: string
  rating: number
  content: string
  images: string[]
  status: 'pending' | 'approved' | 'rejected'
  merchantReply?: {
    content: string
    createdAt: string
  }
  createdAt: string
}

export interface ReviewQuery {
  productName?: string
  status?: string
  rating?: number | null
  hasImages?: boolean | null
  dateRange?: [string, string] | null
  page: number
  size: number
}

export interface ReviewReply {
  content: string
}

// API 接口定义
export const productApi = {
  // 商品管理
  getProducts: (params: ProductQuery) =>
    request.get<{ list: Product[]; total: number }>('/products', { params }),

  getProduct: (id: number) =>
    request.get<Product>(`/products/${id}`),

  createProduct: (data: ProductForm) =>
    request.post<Product>('/products', data),

  updateProduct: (id: number, data: ProductForm) =>
    request.put<Product>(`/products/${id}`, data),

  deleteProduct: (id: number) =>
    request.delete(`/products/${id}`),

  batchDelete: (ids: number[]) =>
    request.delete('/products/batch', { data: { ids } }),

  updateProductStatus: (id: number, status: string) =>
    request.patch(`/products/${id}/status`, { status }),

  batchUpdateStatus: (ids: number[], status: string) =>
    request.patch('/products/batch/status', { ids, status }),

  exportProducts: (params: ProductQuery) =>
    request.get('/products/export', { params, responseType: 'blob' }),

  // 分类管理
  getCategoryTree: () =>
    request.get<Category[]>('/categories/tree'),

  getCategories: (params?: { parentId?: number | null }) =>
    request.get<Category[]>('/categories', { params }),

  getCategory: (id: number) =>
    request.get<Category>(`/categories/${id}`),

  createCategory: (data: CategoryForm) =>
    request.post<Category>('/categories', data),

  updateCategory: (id: number, data: CategoryForm) =>
    request.put<Category>(`/categories/${id}`, data),

  deleteCategory: (id: number) =>
    request.delete(`/categories/${id}`),

  // 评价管理
  getReviews: (params: ReviewQuery) =>
    request.get<{ list: ProductReview[]; total: number }>('/reviews', { params }),

  getReview: (id: number) =>
    request.get<ProductReview>(`/reviews/${id}`),

  approveReview: (id: number) =>
    request.patch(`/reviews/${id}/approve`),

  rejectReview: (id: number, reason: string) =>
    request.patch(`/reviews/${id}/reject`, { reason }),

  batchApprove: (ids: number[]) =>
    request.patch('/reviews/batch/approve', { ids }),

  batchReject: (ids: number[], reason: string) =>
    request.patch('/reviews/batch/reject', { ids, reason }),

  replyReview: (id: number, data: ReviewReply) =>
    request.post(`/reviews/${id}/reply`, data),

  exportReviews: (params: ReviewQuery) =>
    request.get('/reviews/export', { params, responseType: 'blob' })
}

export default productApi
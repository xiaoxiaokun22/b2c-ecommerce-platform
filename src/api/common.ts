// 统一的API接口规范

// 统一的分页参数
export interface PaginationParams {
  page: number;      // 页码，从1开始
  size: number;      // 每页大小
}

// 统一的分页响应
export interface PaginatedResponse<T> {
  items: T[];        // 数据列表
  total: number;     // 总记录数
  page: number;      // 当前页码
  size: number;      // 每页大小
  pages: number;     // 总页数
}

// 统一的API响应格式
export interface ApiResponse<T = any> {
  code: number;      // 状态码
  message: string;   // 响应消息
  data: T;          // 响应数据
  success: boolean; // 是否成功
  timestamp: number; // 时间戳
}

// 常用的状态码
export enum StatusCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500
}

// 标准的CRUD操作路径
export const ApiPath = {
  // RESTful 资源路径规范
  CREATE: '',           // POST /resource
  LIST: '',             // GET /resource
  GET: ':id',           // GET /resource/:id
  UPDATE: ':id',        // PUT /resource/:id
  PATCH: ':id',         // PATCH /resource/:id
  DELETE: ':id',        // DELETE /resource/:id
  BATCH_DELETE: '',     // DELETE /resource (批量删除)
} as const;

// 常用的HTTP方法
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

// 请求选项
export interface RequestOptions {
  method: HttpMethod;
  url: string;
  params?: any;
  data?: any;
  headers?: Record<string, string>;
}

// 生成统一的请求配置
export function createRequestConfig(options: RequestOptions): RequestOptions {
  const config = { ...options };

  // 默认headers
  if (!config.headers) {
    config.headers = {};
  }

  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
}
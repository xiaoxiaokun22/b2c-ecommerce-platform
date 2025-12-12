import axios from 'axios';
import { ElMessage } from 'element-plus';
import type { ApiResponse, RequestOptions, createRequestConfig } from '@/api/common';

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response;

    // 如果响应符合标准格式
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code === 200) {
        return data;
      } else {
        ElMessage.error(data.message || '请求失败');
        return Promise.reject(new Error(data.message || '请求失败'));
      }
    }

    // 如果直接返回数据（兼容旧接口）
    return {
      code: 200,
      message: 'success',
      data: data,
      success: true,
      timestamp: Date.now()
    };
  },
  (error) => {
    let message = '网络错误';

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          message = '未授权，请重新登录';
          // 清除token并跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求地址不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = data?.message || `请求失败: ${status}`;
      }
    } else if (error.request) {
      message = '网络连接失败';
    }

    ElMessage.error(message);
    return Promise.reject(error);
  }
);

// 统一的请求方法
export async function apiRequest<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
  const config = createRequestConfig(options);

  try {
    const response = await request(config);
    return response;
  } catch (error) {
    throw error;
  }
}

// 常用请求方法的快捷方式
export const api = {
  get: <T = any>(url: string, params?: any) =>
    apiRequest<T>({ method: 'GET', url, params }),

  post: <T = any>(url: string, data?: any) =>
    apiRequest<T>({ method: 'POST', url, data }),

  put: <T = any>(url: string, data?: any) =>
    apiRequest<T>({ method: 'PUT', url, data }),

  patch: <T = any>(url: string, data?: any) =>
    apiRequest<T>({ method: 'PATCH', url, data }),

  delete: <T = any>(url: string) =>
    apiRequest<T>({ method: 'DELETE', url })
};

export default request;
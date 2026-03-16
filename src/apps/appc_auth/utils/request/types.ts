import type { AxiosRequestConfig } from 'axios'

/**
 * 待处理请求类型
 */
export interface PendingRequest {
  resolve: (value: any) => void
  reject: (reason?: any) => void
  config: AxiosRequestConfig
}

/**
 * 认证拦截器配置
 */
export interface AuthInterceptorOptions {
  maxRetries?: number
  pendingRequestTimeout?: number
  maxPendingRequests?: number
  refreshDebounceMs?: number
  shouldRefresh?: (error: any) => boolean
  refreshEndpoint?: string
  skipAuthUrls?: string[]
}

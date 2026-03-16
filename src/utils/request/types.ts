import type { AxiosInstance } from 'axios'

/**
 * 拦截器策略接口
 */
export interface InterceptorStrategy {
  getName(): string
  /**
   * 设置请求拦截器
   * @param instance - Axios实例
   */
  setupRequestInterceptors(instance: AxiosInstance): void

  /**
   * 设置响应拦截器
   * @param instance - Axios实例
   */
  setupResponseInterceptors(instance: AxiosInstance): void

  /**
   * 清理资源（可选）
   */
  destroy?(): void
}

/**
 * 基础拦截器配置
 */
export interface BaseInterceptorConfig {
  requestTimeout?: number
  isShowErrorMsg?: boolean
  isNativeResponse?: boolean
  show401Error?: boolean
  addRequestTimestamp?: boolean
  customErrorHandler?: (error: any) => void
  skipUrls?: string[] // 跳过拦截的URL
}

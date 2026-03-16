import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import type { ApiResponse } from '@/types'
import type { InterceptorStrategy } from './types.ts'

/**
 * 基础拦截器
 */
export class BaseInterceptorStrategy implements InterceptorStrategy {
  private config?: {
    // 请求超时
    requestTimeout?: number
    // 是否显示错误提示
    isShowErrorMsg?: boolean
    // 是否返回服务器的原生响应
    isNativeResponse?: boolean
  }

  constructor(config?: {
    requestTimeout?: number
    isShowErrorMsg?: boolean
    isNativeResponse?: boolean
  }) {
    this.config = {
      requestTimeout: config?.requestTimeout ?? 10000,
      isShowErrorMsg: config?.isShowErrorMsg ?? true,
      isNativeResponse: config?.isNativeResponse ?? false,
    }
  }

  getName(): string {
    return 'BasicInterceptorStrategy'
  }

  setupRequestInterceptors(instance: AxiosInstance) {
    instance.interceptors.request.use(
      (config) => {
        // 设置默认超时
        if (!config.timeout) {
          config.timeout = this.config?.requestTimeout
        }

        // 添加请求时间戳
        config.headers['X-Request-Time'] = Date.now()
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )
  }

  // 设置响应拦截器
  setupResponseInterceptors(instance: AxiosInstance): void {
    instance.interceptors.response.use(
      (response) => {
        // 返回原生响应
        if (this.config?.isNativeResponse) {
          return response
        }
        return response.data
      },
      (error) => {
        // 显示错误消息
        if (this.config?.isShowErrorMsg) {
          this.showErrorMsg(error)
        }
        return Promise.reject(error)
      },
    )
  }

  /**
   * 显示错误消息
   */
  private showErrorMsg(error: any): void {
    let message = '未知错误，请稍后重试'

    if (axios.isCancel(error)) {
      // 取消的请求不显示错误
      return
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message = '请求超时，请稍后重试'
    } else if (error.response) {
      const status = error.response.status
      const responseMessage = error.response.data?.message || error.response.data?.msg

      switch (status) {
        case 400:
          message = responseMessage || '请求参数错误'
          break
        case 401:
          // 401错误已经在handle401Error中处理，这里不会执行
          return
        case 403:
          message = responseMessage || '拒绝访问'
          break
        case 404:
          message = responseMessage || '请求资源不存在'
          break
        case 408:
          message = '请求超时'
          break
        case 500:
          message = responseMessage || '服务器内部错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        default:
          message = responseMessage || `连接错误 ${status}`
      }
    } else if (error.request) {
      message = '网络异常，请检查网络连接'
    } else {
      message = error.message || '未知错误'
    }

    console.error('请求错误：', error)
    ElMessage.error(message)
  }
}

/**
 * 组合拦截器策略
 */
export class CompositeInterceptorStrategy implements InterceptorStrategy {
  private strategies: InterceptorStrategy[]

  constructor(strategies: InterceptorStrategy[]) {
    this.strategies = strategies
  }

  /**
   * 添加策略
   */
  addStrategy(strategy: InterceptorStrategy): void {
    this.strategies.push(strategy)
  }

  /**
   * 移除策略
   */
  removeStrategy(strategyName: string): void {
    this.strategies = this.strategies.filter((s) => s.getName?.() !== strategyName)
  }

  /**
   * 获取所有策略
   */
  getStrategies(): InterceptorStrategy[] {
    return [...this.strategies]
  }

  setupRequestInterceptors(instance: AxiosInstance): void {
    // 按照添加顺序设置请求拦截器
    this.strategies.forEach((strategy) => {
      strategy.setupRequestInterceptors(instance)
    })
  }

  setupResponseInterceptors(instance: AxiosInstance): void {
    // 注意：响应拦截器的执行顺序是"先进后出"
    // 所以我们需要反向遍历策略数组
    ;[...this.strategies].reverse().forEach((strategy) => {
      strategy.setupResponseInterceptors(instance)
    })
  }

  getName(): string {
    return 'CompositeInterceptorStrategy'
  }
}

/**
 * HTTP请求类
 * 封装了Axios实例，提供统一的请求处理、拦截器和错误处理机制
 */
export class HttpRequest {
  private readonly instance: AxiosInstance
  private interceptorStrategy: InterceptorStrategy

  /**
   * 构造函数
   * @param config
   * @param interceptorStrategy
   */
  constructor(config: AxiosRequestConfig, interceptorStrategy: InterceptorStrategy) {
    this.instance = axios.create({
      ...config,
      timeout: config.timeout ?? 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    })

    this.interceptorStrategy = interceptorStrategy
    this.setupInterceptors()
  }

  /**
   * 设置拦截器
   */
  private setupInterceptors(): void {
    this.interceptorStrategy.setupRequestInterceptors(this.instance)
    this.interceptorStrategy.setupResponseInterceptors(this.instance)
  }

  /**
   * 发起HTTP请求
   */
  public request<T = any, D = any>(config: AxiosRequestConfig<D>): Promise<ApiResponse<T>> {
    return this.instance.request<T, ApiResponse<T>, D>(config)
  }

  /**
   * 发起GET请求
   */
  public get<T = any, D = any>(
    url: string,
    params?: AxiosRequestConfig['params'], // 使用 Axios 定义的类型
    config?: Omit<AxiosRequestConfig<D>, 'params'>,
  ): Promise<ApiResponse<T>> {
    return this.instance.get<T, ApiResponse<T>, D>(url, {
      ...config,
      params,
    })
  }

  /**
   * 发起POST请求
   */
  public post<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<ApiResponse<T>> {
    return this.instance.post<T, ApiResponse<T>, D>(url, data, config)
  }

  /**
   * 发起PUT请求
   */
  public put<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<ApiResponse<T>> {
    return this.instance.put<T, ApiResponse<T>, D>(url, data, config)
  }

  /**
   * 发起DELETE请求
   */
  public delete<T = any, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ): Promise<ApiResponse<T>> {
    return this.instance.delete<T, ApiResponse<T>, D>(url, config)
  }

  /**
   * 发起PATCH请求
   */
  public patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<ApiResponse<T>> {
    return this.instance.patch<T, ApiResponse<T>, D>(url, data, config)
  }
}

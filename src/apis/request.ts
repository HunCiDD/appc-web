import type {AxiosInstance, AxiosResponse, InternalAxiosRequestConfig} from 'axios'
import axios, {AxiosError} from 'axios'
import type {HttpRequestConfig, PendingRequest} from './types.ts'
import type {ApiResponse} from '@/types'
import type {Token} from '@/apps/appc-auth/types'
import {useTokenStore} from '@/apps/appc-auth/stores/token.ts'
import {ElMessage, ElMessageBox} from 'element-plus'
import router from '@/router'


/**
 * HTTP请求类
 * 封装了Axios实例，提供统一的请求处理、拦截器和错误处理机制
 */
export class HttpRequest {
  instance: AxiosInstance
  private isRefreshing: boolean = false
  private refreshTimes: number = 0
  private readonly maxRefreshTimes: number = 1
  private pendingRequests: PendingRequest[] = []
  private refreshTimeout: number = 30000 // 30秒刷新超时

  /**
   * 构造函数
   * @param config - HTTP请求配置
   */
  constructor(config: HttpRequestConfig = {}) {
    this.instance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    })

    this.setupInterceptors()
  }

  /**
   * 重置刷新状态
   */
  public resetRefreshState(): void {
    this.isRefreshing = false
    this.refreshTimes = 0
    this.clearPendingRequestsWithError(new Error('Token刷新状态已重置'))
  }

  /**
   * 取消所有等待中的请求
   */
  public cancelPendingRequests(reason: string = '请求被取消'): void {
    this.clearPendingRequestsWithError(new Error(reason))
  }

  /**
   * 发起HTTP请求
   */
  public request<T = any, D = any>(config: HttpRequestConfig<D>): Promise<ApiResponse<T>> {
    return this.instance.request<T, ApiResponse<T>, D>(config)
  }

  /**
   * 发起GET请求
   */
  public get<T = any, D = any>(
    url: string,
    config?: HttpRequestConfig<D>,
  ): Promise<ApiResponse<T>> {
    return this.instance.get<T, ApiResponse<T>, D>(url, config)
  }

  /**
   * 发起POST请求
   */
  public post<T = any, D = any>(
    url: string,
    data?: D,
    config?: HttpRequestConfig<D>,
  ): Promise<ApiResponse<T>> {
    return this.instance.post<T, ApiResponse<T>, D>(url, data, config)
  }

  /**
   * 发起PUT请求
   */
  public put<T = any, D = any>(
    url: string,
    data?: D,
    config?: HttpRequestConfig<D>,
  ): Promise<ApiResponse<T>> {
    return this.instance.put<T, ApiResponse<T>, D>(url, data, config)
  }

  /**
   * 发起DELETE请求
   */
  public delete<T = any, D = any>(
    url: string,
    config?: HttpRequestConfig<D>,
  ): Promise<ApiResponse<T>> {
    return this.instance.delete<T, ApiResponse<T>, D>(url, config)
  }

  /**
   * 发起PATCH请求
   */
  public patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: HttpRequestConfig<D>,
  ): Promise<ApiResponse<T>> {
    return this.instance.patch<T, ApiResponse<T>, D>(url, data, config)
  }

  /**
   * 获取当前刷新状态
   */
  public getRefreshState(): { isRefreshing: boolean; refreshTimes: number; pendingCount: number } {
    return {
      isRefreshing: this.isRefreshing,
      refreshTimes: this.refreshTimes,
      pendingCount: this.pendingRequests.length
    }
  }

  /**
   * 设置拦截器
   * @private
   */
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const tokenStore = useTokenStore()

        if (tokenStore.isAuthenticated) {
          config.headers.Authorization = `Bearer ${tokenStore.accessToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const config = response.config as HttpRequestConfig

        if (config.isNativeResponse) {
          return response
        }

        return response.data
      },
      async (error: AxiosError) => {
        const config = error.config as HttpRequestConfig

        // 如果是取消的请求，不处理
        if (axios.isCancel(error)) {
          return Promise.reject(error)
        }

        // 401错误处理
        if (error.response?.status === 401) {
          try {
            return await this.handle401Error(error)
          } catch (authError) {
            return Promise.reject(authError)
          }
        }

        // 其他错误显示消息
        if (config?.isShowErrorMsg !== false) {
          this.showErrorMsg(error)
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * 重定向到登录页面
   */
  private async redirectToLogin(): Promise<void> {
    const tokenStore = useTokenStore()

    try {
      await ElMessageBox.confirm(
        '登录已过期，请重新登录',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    } catch (dialogError) {
      // 用户取消确认框，继续执行清理逻辑
    } finally {
      // 清理Token
      tokenStore.clearTokens()
      this.resetRefreshState()

      // 跳转到登录页面
      try {
        await router.push({path: '/login', query: {redirect: router.currentRoute.value.fullPath}})
      } catch (routerError) {
        console.error('路由跳转失败:', routerError)
      }
    }
  }

  /**
   * 刷新Token
   */
  private async refreshToken(error: AxiosError): Promise<any> {
    if (this.isRefreshing) {
      return this.addToPendingRequests(error.config as InternalAxiosRequestConfig)
    }

    this.refreshTimes++
    this.isRefreshing = true

    try {
      const tokenStore = useTokenStore()

      // 创建新的axios实例避免拦截器循环，添加超时控制
      const refreshAxios = axios.create({
        baseURL: error.config?.baseURL,
        timeout: this.refreshTimeout,
      })

      const response = await refreshAxios.post<ApiResponse<Token>>(
        '/token/refresh',
        {refreshToken: tokenStore.refreshToken}
      )

      if (!response.data?.data) {
        throw new Error('刷新Token响应数据格式错误')
      }

      const token = response.data.data

      // 更新token store
      tokenStore.setTokens(
        token.access_token,
        token.refresh_token,
        token.token_type || 'Bearer'
      )

      // 更新原请求的Authorization头
      const originalConfig = error.config as InternalAxiosRequestConfig
      if (originalConfig?.headers) {
        originalConfig.headers.Authorization = `Bearer ${token.access_token}`
      }

      // 执行所有等待的请求
      this.executePendingRequests(token.access_token)

      // 重试原请求
      if (originalConfig) {
        return this.instance.request(originalConfig)
      } else {
        throw new Error('原始请求配置不存在')
      }
    } catch (refreshError) {
      // 刷新token失败，清理并跳转到登录页
      this.clearPendingRequestsWithError(refreshError)
      await this.redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * 将请求添加到等待队列
   */
  private addToPendingRequests(config: InternalAxiosRequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      // 添加超时处理
      const timeoutId = setTimeout(() => {
        const index = this.pendingRequests.findIndex(req => req.config === config)
        if (index > -1) {
          this.pendingRequests.splice(index, 1)
          reject(new Error('等待Token刷新超时'))
        }
      }, this.refreshTimeout)

      this.pendingRequests.push({
        resolve: (value) => {
          clearTimeout(timeoutId)
          resolve(value)
        },
        reject: (reason) => {
          clearTimeout(timeoutId)
          reject(reason)
        },
        config
      })
    })
  }

  /**
   * 执行等待中的请求
   */
  private executePendingRequests(token: string): void {
    this.pendingRequests.forEach(({resolve, reject, config}) => {
      try {
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        resolve(this.instance.request(config))
      } catch (err) {
        reject(err)
      }
    })
    this.pendingRequests = []
  }

  /**
   * 清空等待队列并拒绝所有请求
   */
  private clearPendingRequestsWithError(error: any): void {
    this.pendingRequests.forEach(({reject}) => {
      reject(error)
    })
    this.pendingRequests = []
  }

  /**
   * 401错误处理
   */
  private async handle401Error(error: AxiosError): Promise<any> {
    const tokenStore = useTokenStore()

    // 检查是否有refresh token - 修复逻辑错误
    if (!tokenStore.refreshToken) {
      await this.redirectToLogin()
      return Promise.reject(error)
    }

    // 检查是否超过最大重试次数
    if (this.refreshTimes >= this.maxRefreshTimes) {
      console.warn('Token刷新次数超过限制，跳转登录页面')
      await this.redirectToLogin()
      return Promise.reject(error)
    }

    // 尝试刷新token
    return this.refreshToken(error)
  }

  /**
   * 显示错误消息
   */
  private showErrorMsg(error: any): void {
    let message = '网络错误，请稍后重试'

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

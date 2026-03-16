import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import router from '@/router'
import type { InterceptorStrategy } from '@/utils/request/types.ts'
import type { AuthInterceptorOptions, PendingRequest } from './types.ts'
import { useTokenStore } from '@/stores/token.ts'
import { API_URL, baseApi } from '@/apis'

// 使用 Symbol 避免属性名冲突
const RETRY_COUNT_KEY = Symbol('retryCount')

enum AuthState {
  IDLE = 'IDLE',
  REFRESHING = 'REFRESHING',
  FAILED = 'FAILED',
}

export class AuthInterceptorStrategy implements InterceptorStrategy {
  private tokenStore: ReturnType<typeof useTokenStore>

  private state: AuthState = AuthState.IDLE
  private pendingRequests: Array<PendingRequest> = []
  // 用于避免重复刷新Token的标志
  private refreshPromise: Promise<string> | null = null
  private lastRefreshTime = 0

  // 配置选项
  private readonly maxRetries: number
  private readonly pendingRequestTimeout: number
  private readonly maxPendingRequests: number
  private readonly refreshDebounceMs: number
  private readonly shouldRefresh: (error: any) => boolean

  constructor(options: Partial<AuthInterceptorOptions> = {}) {
    this.tokenStore = useTokenStore()

    this.maxRetries = options.maxRetries || 3
    this.pendingRequestTimeout = options.pendingRequestTimeout || 30000 // 30秒
    this.maxPendingRequests = options.maxPendingRequests || 50
    this.refreshDebounceMs = options.refreshDebounceMs || 1000 // 1秒防抖
    this.shouldRefresh = options.shouldRefresh || ((error) => error.response?.status === 401)
  }

  getName(): string {
    return 'AuthInterceptorStrategy'
  }

  setupRequestInterceptors(instance: AxiosInstance): void {
    instance.interceptors.request.use(
      (config) => {
        // 从tokenStore 获取 accessToken
        const accessToken = this.tokenStore.accessToken
        const tokenType = this.tokenStore.tokenType || 'Bearer'

        // 如果有token，添加到请求头
        if (accessToken && !this.isRefreshTokenRequest(config)) {
          config.headers.Authorization = `${tokenType} ${accessToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )
  }

  setupResponseInterceptors(instance: AxiosInstance): void {
    instance.interceptors.response.use(
      (response) => {
        return response
      },
      async (error) => {
        // 记录原始请求
        const originalRequest = error.config

        if (!this.shouldRefresh(error)) {
          return Promise.reject(error)
        }

        // 如果是刷新token的请求失败，直接跳转到登录
        if (this.isRefreshTokenRequest(originalRequest)) {
          return this.handleRefreshTokenFailed()
        }

        // 如果没有refreshToken，直接跳转到登录页
        if (!this.tokenStore.refreshToken) {
          return this.handleRefreshTokenFailed()
        }

        // 检查是否达到最大重试次数
        const retryCount = (originalRequest[RETRY_COUNT_KEY] as number) || 0
        if (retryCount >= this.maxRetries) {
          return Promise.reject(new Error('Max retry attempts exceeded'))
        }

        // 防抖检查，避免短时间内多次刷新
        const now = Date.now()
        if (now - this.lastRefreshTime < this.refreshDebounceMs) {
          return this.addToPendingQueue(originalRequest)
        }

        // 标记开始刷新token
        this.state = AuthState.REFRESHING
        originalRequest[RETRY_COUNT_KEY] = (originalRequest[RETRY_COUNT_KEY] as number) || 0

        try {
          // 防止重复刷新，如果已经有刷新请求在进行中，等待它完成
          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshToken()
            this.lastRefreshTime = Date.now()
          }
          const newAccessToken = await this.refreshPromise
          // 更新状态
          this.state = AuthState.IDLE
          this.refreshPromise = null
          // 重试所有失败的请求
          this.retryPendingRequests(newAccessToken)
          // 重试当前请求
          return this.retryRequest(originalRequest, newAccessToken)
        } catch (refreshError) {
          // 刷新token失败，清理状态并跳转登录
          this.state = AuthState.FAILED
          this.refreshPromise = null
          return this.handleRefreshTokenFailed(refreshError)
        } finally {
          // 确保状态被正确重置
          if (this.state === AuthState.REFRESHING) {
            this.state = AuthState.IDLE
          }
        }
      },
    )
  }

  // ----------------- 私有方法 ---------------------------
  /**
   * 判断是否为刷新token的请求
   */
  private isRefreshTokenRequest(config: AxiosRequestConfig): boolean {
    return config.url?.includes(API_URL.TOKEN_REFRESH_URL) || false
  }

  /**
   * 重定向登录页
   * @private
   */
  private async redirectToLogin() {
    try {
      console.log('Token 失效，跳转登录页...')
      // 使用你实际使用的UI库的消息组件
      // ElMessage.error('登录已过期，请重新登录')
      await router.push('/login')
    } catch (error) {
      console.error('Redirect to login failed:', error)
    }
  }

  /**
   * 将请求添加到等待队列
   */
  private addToPendingQueue(originalRequest: AxiosRequestConfig) {
    return new Promise((resolve, reject) => {
      // 检查队列大小，避免内存泄漏
      if (this.pendingRequests.length >= this.maxPendingRequests) {
        // 清理最旧的请求
        const oldest = this.pendingRequests.shift()
        oldest?.reject(new Error('Too many pending request'))
      }

      const timeoutId = setTimeout(() => {
        // 从队列中移除超时的请求
        const index = this.pendingRequests.findIndex((p) => p.config === originalRequest)
        if (index > -1) {
          this.pendingRequests.splice(index, 1)
          reject(new Error('Request timeout while refreshing token'))
        }
      }, this.pendingRequestTimeout)

      const pendingRequest: PendingRequest = {
        resolve: (value) => {
          clearTimeout(timeoutId)
          resolve(value)
        },
        reject: (error) => {
          clearTimeout(timeoutId)
          reject(error)
        },
        config: originalRequest,
      }

      this.pendingRequests.push(pendingRequest)
    })
  }

  /**
   * 处理刷新token失败
   * @private
   */
  private async handleRefreshTokenFailed(error?: any): Promise<never> {
    // 清空token
    this.tokenStore.clear()
    // 拒绝所有等待的请求
    this.pendingRequests.forEach((pending) => {
      pending.reject(new Error('Token refresh failed'))
    })
    this.pendingRequests = []
    // 重置状态
    this.state = AuthState.IDLE
    this.refreshPromise = null
    // 跳转到登录页面
    await this.redirectToLogin()

    return Promise.reject(new Error('认证失败，请重新登录'))
  }

  private async refreshToken(): Promise<string> {
    try {
      const refreshToken = this.tokenStore.refreshToken
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await baseApi.refreshToken({ refresh_token: refreshToken })

      if (response.code === 200 && response.data) {
        // 更新tokenStore中的token
        this.tokenStore.add(response.data)
        return response.data.accessToken
      } else {
        throw new Error('Refresh token failed')
      }
    } catch (error) {
      console.error('刷新Token失败:', error)
      throw error
    }
  }

  /**
   * 重试请求
   */
  private async retryRequest(
    originalRequest: AxiosRequestConfig,
    newAccessToken: string,
  ): Promise<AxiosResponse> {
    // 更新请求头的Authorization
    const tokenType = this.tokenStore.tokenType || 'Bearer'
    originalRequest.headers = originalRequest.headers || {}
    originalRequest.headers.Authorization = `${tokenType} ${newAccessToken}`

    // 增加重试计数
    // @ts-ignore
    const currentRetryCount = (originalRequest[RETRY_COUNT_KEY] as number) || 0
    // @ts-ignore
    originalRequest[RETRY_COUNT_KEY] = currentRetryCount + 1

    // 使用axios的原始配置重新发送请求
    return axios(originalRequest)
  }

  /**
   * 重试所有等待的请求
   */
  private retryPendingRequests(newAccessToken: string): void {
    const tokenType = this.tokenStore.tokenType || 'Bearer'
    const requestsToRetry = [...this.pendingRequests]

    // 清空队列
    this.pendingRequests = []

    // 重试所有等待的请求
    requestsToRetry.forEach((pending) => {
      pending.config.headers = pending.config.headers || {}
      pending.config.headers.Authorization = `${tokenType} ${newAccessToken}`

      // 使用新的token重试请求
      axios(pending.config)
        .then((response) => pending.resolve(response))
        .catch((error) => pending.reject(error))
    })
  }

  /**
   * 清理所有等待的请求
   */
  public clearPendingRequests(): void {
    this.pendingRequests.forEach((pending) => {
      pending.reject(new Error('Auth interceptor cleared'))
    })
    this.pendingRequests = []
  }
}

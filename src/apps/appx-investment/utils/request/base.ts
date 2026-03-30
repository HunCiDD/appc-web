import type { InterceptorStrategy } from '@/utils/request/types'
import type { AxiosInstance } from 'axios'

/**
 * 投资模块拦截器策略
 * 目前使用基础策略，可在此添加投资模块特定逻辑
 */
export class InvestmentInterceptorStrategy implements InterceptorStrategy {
  getName(): string {
    return 'InvestmentInterceptorStrategy'
  }

  setupRequestInterceptors(instance: AxiosInstance): void {
    // 可添加投资模块特定的请求拦截逻辑
    // 例如：添加投资相关请求头
  }

  setupResponseInterceptors(instance: AxiosInstance): void {
    // 可添加投资模块特定的响应拦截逻辑
    // 例如：处理投资相关错误码
  }
}
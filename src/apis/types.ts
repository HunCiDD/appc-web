import type {AxiosRequestConfig, InternalAxiosRequestConfig} from 'axios'

/**
 * HTTP请求配置
 * 扩展自AxiosRequestConfig，添加自定义配置项
 * @template T - 响应数据类型
 */
export interface HttpRequestConfig<D = any> extends AxiosRequestConfig<D> {
  // 是否显示错误提示
  isShowErrorMsg?: boolean
  // 是否返回服务器的原生响应
  isNativeResponse?: boolean
  // 是否需要认证
  isAuth?: boolean
}


// 重试请求的回调函数类型
export interface PendingRequest {
  resolve: (value: any) => void
  reject: (reason?: any) => void
  config: InternalAxiosRequestConfig
}

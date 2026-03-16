/**
 * API Response Interface
 * @template T
 * @property {number} code - Response code
 * @property {T} data - Response data
 * @property {string} message - Response message
 */
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
  [key: string]: any
}

/**
 * 分页数据
 */
export interface PageData<T> {
  items: T[]
  page: number
  size: number
  total: number
  pages: number
}

/**
 * 账号登录
 */
export interface AccountLogin {
  username: string
  password: string
}

/**
 * 认证的Token信息
 */
export interface Token {
  access_token: string
  refresh_token: string
  token_type: string
  expires: number
}

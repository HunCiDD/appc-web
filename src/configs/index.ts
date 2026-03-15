/**
 * 应用配置模块
 * 包含环境变量和API配置
 */

type ENV = 'dev' | 'prod' | 'test'

// 当前环境变量
const env: ENV = 'dev'

// API配置
const apiConfig = {
  dev: {
    baseAPi: '/api',
  },
  prod: {
    baseAPi: '/api',
  },
  test: {
    baseAPi: '/api',
  },
}

// 基础API地址（从当前环境配置获取）
export const BASE_URL = apiConfig[env].baseAPi

// 请求超时时间（单位：毫秒）
export const TIME_OUT = 10000

// 默认导出配置对象
export default {
  env,
  ...apiConfig[env],
}

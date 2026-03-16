import {defineStore} from 'pinia'
import type {Token, UserInfo, UserLoginForm} from '@/apps/appc_auth/types'
import type {ApiResponse} from '@/types'
import {tokenRefreshApi, tokenUserInfoApi, userLoginApi} from '@/apps/appc_auth/apis'

export const useTokenStore = defineStore('token', () => {
  // 状态 - 添加storage事件监听确保多标签页同步
  const getStoredItem = (key: string): string | null => {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null
  }

  const accessToken = ref<string | null>(getStoredItem('accessToken'))
  const refreshToken = ref<string | null>(getStoredItem('refreshToken'))
  const tokenType = ref<string | null>(getStoredItem('tokenType') || 'Bearer') // 默认值

  // 监听storage变化实现多标签页同步
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === 'accessToken') accessToken.value = e.newValue
      if (e.key === 'refreshToken') refreshToken.value = e.newValue
      if (e.key === 'tokenType') tokenType.value = e.newValue
    })
  }

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value)

  // Actions
  const userLogin = async (data: UserLoginForm): Promise<ApiResponse<Token>> => {
    try {
      const response = await userLoginApi(data)
      if (!response) {
        throw new Error('登录请求失败')
      }

      const {access_token, refresh_token, token_type} = response.data as Token
      setTokens(access_token, refresh_token, token_type)
      return response
    } catch (error) {
      clearTokens()
      throw error // 重新抛出错误让调用方处理
    }
  }

  const logout = () => {
    clearTokens()
    // 可以添加其他清理逻辑，如清除用户信息等
  }

  const tokenRefresh = async (): Promise<void> => {
    if (!refreshToken.value) {
      throw new Error('刷新令牌不存在')
    }

    try {
      const response = await tokenRefreshApi(refreshToken.value)
      if (!response) {
        throw new Error('令牌刷新失败')
      }

      const {access_token, refresh_token, token_type} = response.data as Token
      setTokens(access_token, refresh_token, token_type)
    } catch (error) {
      clearTokens() // 刷新失败时清除所有令牌
      throw error
    }
  }

  const tokenUser = async (): Promise<ApiResponse<UserInfo>> => {
    if (!accessToken.value) {
      throw new Error('访问令牌不存在')
    }

    const response = await tokenUserInfoApi(accessToken.value)
    if (!response) {
      throw new Error('获取用户信息失败')
    }

    return response
  }

  const setTokens = (
    newAccessToken: string,
    newRefreshToken?: string,
    newTokenType?: string
  ) => {
    accessToken.value = newAccessToken
    refreshToken.value = newRefreshToken || null
    tokenType.value = newTokenType || 'Bearer'

    // 持久化到localStorage
    localStorage.setItem('accessToken', newAccessToken)
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken)
    }
    localStorage.setItem('tokenType', tokenType.value)
  }

  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null
    tokenType.value = null

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('tokenType')
  }

  return {
    // 状态
    accessToken,
    refreshToken,
    tokenType,

    // Getters
    isAuthenticated,

    // Actions
    userLogin,
    logout,
    tokenRefresh,
    tokenUser,
    setTokens,
    clearTokens,
  }
})

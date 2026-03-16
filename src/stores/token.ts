import { defineStore } from 'pinia'
import type { ApiResponse, Token } from '@/types'

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN_TYPE: 'tokenType',
} as const

export const useTokenStore = defineStore('token', () => {
  // 状态 - 添加storage事件监听确保多标签页同步

  const accessToken = ref<string>(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || '')
  const refreshToken = ref<string>(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || '')
  const tokenType = ref<string>(localStorage.getItem(STORAGE_KEYS.TOKEN_TYPE) || 'Bearer') // 默认值

  // Getters
  const getAccessToken = computed(() => accessToken.value)
  const getRefreshToken = computed(() => refreshToken.value)
  const getTokenType = computed(() => tokenType.value)

  // 是否已认证
  const isAuthenticated = computed(() => !!accessToken.value)

  const add = (token: Token): void => {
    accessToken.value = token.access_token
    refreshToken.value = token.refresh_token
    tokenType.value = token.token_type || 'Bearer'

    // 持久化到localStorage
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token.access_token)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token.refresh_token)
    localStorage.setItem(STORAGE_KEYS.TOKEN_TYPE, token.token_type || 'Bearer')
  }

  const clear = (): void => {
    // 清空状态
    accessToken.value = ''
    refreshToken.value = ''
    tokenType.value = ''

    // 清空存储 - 使用常量避免重复
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }

  const get = () => {
    return {
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
      tokenType: tokenType.value,
    }
  }

  return {
    accessToken: getAccessToken,
    refreshToken: getRefreshToken,
    tokenType: getTokenType,
    isAuthenticated,

    add,
    clear,
    get,
  }
})

import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {UserInfo} from '@/apps/appc_auth/types'

// 存储键名常量，避免硬编码
const STORAGE_KEYS = {
  USER_ID: 'userID',
  USERNAME: 'username',
  NICKNAME: 'nickname',
  PHONE: 'phone',
  EMAIL: 'email'
} as const

export const useUserStore = defineStore('user', () => {
  // 状态 - 添加默认值处理
  const userID = ref<string>(localStorage.getItem(STORAGE_KEYS.USER_ID) || '')
  const username = ref<string>(localStorage.getItem(STORAGE_KEYS.USERNAME) || '')
  const nickname = ref<string>(localStorage.getItem(STORAGE_KEYS.NICKNAME) || '')
  const phone = ref<string>(localStorage.getItem(STORAGE_KEYS.PHONE) || '')
  const email = ref<string>(localStorage.getItem(STORAGE_KEYS.EMAIL) || '')

  // Getters - 修正逻辑并提供更有用的计算属性
  const getUserID = computed(() => userID.value)
  const getUsername = computed(() => username.value)
  const getNickname = computed(() => nickname.value)
  const getPhone = computed(() => phone.value)
  const getEmail = computed(() => email.value)

  // 有用的状态检查
  const isLoggedIn = computed(() => !!userID.value)
  const hasUserInfo = computed(() => !!userID.value && !!username.value)

  // 同步状态到 localStorage 的辅助函数
  const syncToStorage = (key: string, value: string) => {
    if (value) {
      localStorage.setItem(key, value)
    } else {
      localStorage.removeItem(key)
    }
  }

  // Actions
  const setUser = (user: UserInfo): void => {
    userID.value = user.id
    username.value = user.username
    nickname.value = user.nickname
    phone.value = user.phone
    email.value = user.email

    // 同步到 localStorage
    syncToStorage(STORAGE_KEYS.USER_ID, user.id)
    syncToStorage(STORAGE_KEYS.USERNAME, user.username)
    syncToStorage(STORAGE_KEYS.NICKNAME, user.nickname)
    syncToStorage(STORAGE_KEYS.PHONE, user.phone)
    syncToStorage(STORAGE_KEYS.EMAIL, user.email)
  }

  const updateUserInfo = (updates: Partial<UserInfo>): void => {
    if (updates.id) {
      userID.value = updates.id
      syncToStorage(STORAGE_KEYS.USER_ID, updates.id)
    }
    if (updates.username) {
      username.value = updates.username
      syncToStorage(STORAGE_KEYS.USERNAME, updates.username)
    }
    if (updates.nickname) {
      nickname.value = updates.nickname
      syncToStorage(STORAGE_KEYS.NICKNAME, updates.nickname)
    }
    if (updates.phone) {
      phone.value = updates.phone
      syncToStorage(STORAGE_KEYS.PHONE, updates.phone)
    }
    if (updates.email) {
      email.value = updates.email
      syncToStorage(STORAGE_KEYS.EMAIL, updates.email)
    }
  }

  const clearUser = (): void => {
    // 清空状态
    userID.value = ''
    username.value = ''
    nickname.value = ''
    phone.value = ''
    email.value = ''

    // 清空存储 - 使用常量避免重复
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  // 初始化时验证数据完整性
  const initializeStore = (): void => {
    // 如果有 userID 但没有其他基本信息，视为数据不完整
    if (userID.value && !username.value) {
      console.warn('用户数据不完整，执行清理')
      clearUser()
    }
  }

  // 执行初始化
  initializeStore()

  return {
    // 状态（只读）
    userID: getUserID,
    username: getUsername,
    nickname: getNickname,
    phone: getPhone,
    email: getEmail,

    // 计算属性
    isLoggedIn,
    hasUserInfo,

    // 方法
    setUser,
    updateUserInfo,
    clearUser
  }
})

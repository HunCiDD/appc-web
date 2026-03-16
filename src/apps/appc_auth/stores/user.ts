import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { UserGet } from '@/apps/appc_auth/types'

// 存储键名常量，避免硬编码
const STORAGE_KEYS = {
  ID: 'id',
  USERNAME: 'username',
  NICKNAME: 'nickname',
  PHONE: 'phone',
  EMAIL: 'email',
} as const

export const useUserStore = defineStore('user', () => {
    // 状态 - 添加默认值处理
    const id = ref<string>(localStorage.getItem(STORAGE_KEYS.ID) || '')
    const username = ref<string>(localStorage.getItem(STORAGE_KEYS.USERNAME) || '')
    const nickname = ref<string>(localStorage.getItem(STORAGE_KEYS.NICKNAME) || '')
    const phone = ref<string>(localStorage.getItem(STORAGE_KEYS.PHONE) || '')
    const email = ref<string>(localStorage.getItem(STORAGE_KEYS.EMAIL) || '')

    // Getters - 修正逻辑并提供更有用的计算属性
    const getID = computed(() => id.value)
    const getUsername = computed(() => username.value)
    const getNickname = computed(() => nickname.value)
    const getPhone = computed(() => phone.value)
    const getEmail = computed(() => email.value)

    // 有用的状态检查
    // 是否已登录
    const isLoggedIn = computed(() => !!id.value)

    // Actions - 行动
    const add = (user: UserGet): void => {
      id.value = user.id
      username.value = user.username
      nickname.value = user.nickname
      phone.value = user.phone
      email.value = user.email

      // 同步到 localStorage
      localStorage.setItem(STORAGE_KEYS.ID, user.id)
      localStorage.setItem(STORAGE_KEYS.USERNAME, user.username)
      localStorage.setItem(STORAGE_KEYS.NICKNAME, user.nickname)
      localStorage.setItem(STORAGE_KEYS.PHONE, user.phone)
      localStorage.setItem(STORAGE_KEYS.EMAIL, user.email)
    }

    const clear = (): void => {
      // 清空状态
      id.value = ''
      username.value = ''
      nickname.value = ''
      phone.value = ''
      email.value = ''

      // 清空存储 - 使用常量避免重复
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
      })
    }

    return {
      // 状态（只读）
      id: getID,
      username: getUsername,
      nickname: getNickname,
      phone: getPhone,
      email: getEmail,

      // 计算属性
      isLoggedIn,

      // 方法
      add,
      clear,
    }
  })

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'
import { PATTERNS } from '@/utils/constants.ts'
import type { ApiResponse, Token } from '@/types/index.ts'
import { useTokenStore } from '@/stores/token'
import { baseApi } from '@/apis'
import { useUserStore } from '@/apps/appc_auth/stores/user.ts'
import { authApi } from '@/apps/appc_auth/apis'
import type { UserGet } from '@/apps/appc_auth/types'

const router = useRouter()
const tokenStore = useTokenStore()
const userStore = useUserStore()

const loginForm = reactive({
  username: '',
  password: '',
})
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 64, message: '用户名长度应在 3 到 64 个字符之间', trigger: 'blur' },
    {
      pattern: PATTERNS.username,
      message: '用户名需由字母、数字和下划线组成',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 128, message: '密码长度应在 8 到 128 个字符之间', trigger: 'blur' },
    {
      pattern: PATTERNS.password,
      message: '密码需包含大小写字母、数字和特殊字符(!_@#$%^&*?())',
      trigger: 'blur',
    },
  ],
}

const formRef = ref<FormInstance>()
const isLoading = ref(false)

const onSubmit = async () => {
  isLoading.value = true
  // 表单校验
  await formRef.value?.validate().catch((err) => {
    isLoading.value = false
    ElMessage.error('表单校验失败')
    return new Promise(() => {})
  })

  // 正式发送登录请求
  try {
    const login_rsp: ApiResponse<Token> = await baseApi.accountLogin({
      username: loginForm.username,
      password: loginForm.password,
    })
    console.log(login_rsp)
    if (login_rsp.code !== 200) {
      ElMessage.error('登录失败: ' + login_rsp.message)
      isLoading.value = false
      return
    }

    // 设置token
    tokenStore.add(login_rsp.data)
    const user_rsp: ApiResponse<UserGet> = await authApi.getUserInfo(tokenStore.accessToken)
    console.log(user_rsp)
    if (user_rsp.code !== 200) {
      ElMessage.error('获取用户信息失败: ' + login_rsp.message)
      isLoading.value = false
      return
    }
    ElMessage.success('登录成功')
    isLoading.value = false
    // 设置token
    tokenStore.add(login_rsp.data)
    // 设置用户信息
    userStore.add(user_rsp.data)
    await router.push({ path: '/' })
  } catch (error) {
    console.error(error)
    isLoading.value = false
    ElMessage.error('登录请求失败: ' + (error as Error).message)
    return
  }
}
</script>

<template>
  <el-form ref="formRef" :model="loginForm" :rules="loginRules" class="max-w-[600px]">
    <el-form-item prop="username">
      <el-input v-model="loginForm.username" placeholder="请输入用户名" clearable />
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="loginForm.password" placeholder="请输入密码" type="password" clearable />
    </el-form-item>
    <el-form-item class="button">
      <el-button class="w-full" type="primary" @click="onSubmit">登录</el-button>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
.button {
  padding-top: 15px;
}
</style>

<script lang="ts" setup>
import type {FormInstance, FormRules} from 'element-plus'
import type {ApiResponse} from '@/types'
import type {Token} from '@/apps/appc-auth/types'
import {useTokenStore} from '@/apps/appc-auth/stores/token.ts'

const router = useRouter()
const tokenStore = useTokenStore()

const accountForm = reactive({
  username: '',
  password: '',
})
const accountRules: FormRules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 5, max: 20, message: '用户名长度应在 5 到 20 个字符之间', trigger: 'blur'},
    {
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: '用户名只能包含字母、数字、下划线和连字符',
      trigger: 'blur',
    },
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 20, message: '密码长度应在 6 到 20 个字符之间', trigger: 'blur'},
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: '密码必须包含大小写字母和数字',
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
    return new Promise(() => {
    })
  })

  // 正式发送登录请求
  try {
    console.log('正式登录请求')
    const res: ApiResponse<Token> = await tokenStore.userLogin(accountForm)
    console.log(res)
    if (res.code == 200) {
      // 设置token
      ElMessage.success('登录成功')
      isLoading.value = false
      router.push({path: '/'})
    } else {
      ElMessage.error('登录失败: ' + res.message)
      isLoading.value = false
      return
    }
  } catch (error) {
    console.error(error)
    isLoading.value = false
    ElMessage.error('登录请求失败: ' + (error as Error).message)
    return
  }
}
</script>

<template>
  <el-form ref="formRef" :model="accountForm" :rules="accountRules" class="max-w-[600px]">
    <el-form-item prop="username">
      <el-input v-model="accountForm.username" placeholder="请输入用户名"/>
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="accountForm.password" placeholder="请输入密码" type="password"/>
    </el-form-item>
    <el-form-item>
      <el-button class="w-full" type="primary" @click="onSubmit">登录</el-button>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped></style>

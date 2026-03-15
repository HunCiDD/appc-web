<script lang="ts" setup>
import type {FormInstance, FormRules} from 'element-plus'

const accountForm = reactive({
  username: '',
  password: '',
})
const accountRules: FormRules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur'},
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur'},
  ],
}

const formRef = ref<FormInstance>()

const onSubmit = async () => {
  // 表单校验
  await formRef.value?.validate().catch((err) => {
    ElMessage.error('表单校验失败')
    return new Promise(() => {
    })
  })

  // 正式发送登录请求
  console.log('正式登录请求')
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

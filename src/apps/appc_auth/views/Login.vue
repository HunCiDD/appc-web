<script lang="ts" setup>
import AccountLoginForm from '@/apps/appc_auth/components/AccountLoginForm.vue'
import PhoneLoginForm from '@/apps/appc_auth/components/PhoneLoginForm.vue'

// 定义登录类型，默认为账号登录
const loginType = ref<string>('account')
</script>

<template>
  <el-row class="min-h-screen">
    <el-col
      :lg="16"
      :md="12"
      class="flex flex-col justify-items-center place-content-center bg-indigo-500"
    >
      <div class="font-bold text-5xl text-white">欢迎光临</div>
      <div class="text-2xl text-gray-200">AI Life</div>
    </el-col>
    <el-col
      :lg="8"
      :md="12"
      class="flex flex-col justify-items-center place-content-center bg-white"
    >
      <h2 class="font-bold text-3xl text-gray-400 my-1">欢迎回来</h2>
      <div class="tabs">
        <el-tabs v-model="loginType" stretch>
          <el-tab-pane label="账号登录" name="account">
            <template #label>
              <span class="icon">
                <el-icon><IEpUser /></el-icon>
                <span class="ml-2">账号登录</span>
              </span>
            </template>
            <AccountLoginForm />
          </el-tab-pane>
          <el-tab-pane label="手机登录" name="phone">
            <template #label>
              <span class="icon">
                <el-icon><IEpPhone /></el-icon>
                <span class="ml-2">手机登录</span>
              </span>
            </template>
            <PhoneLoginForm />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped></style>

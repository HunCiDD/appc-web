<script lang="ts" setup>
import {home} from '@/apps/appc-auth/apis/index'
import type {ApiResponse} from '@/apis/types'

const data = ref<string>('UserAdmin')

onMounted(() => {
  home()
    .then((res: ApiResponse<string>) => {
      data.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
})
</script>

<template>
  <h1>User Admin Page</h1>
  <div>{{ data }}</div>
</template>

<style scoped></style>

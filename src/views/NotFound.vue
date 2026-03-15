<template>
  <div>
    <el-result icon="error" sub-title="Please follow the instructions" title="404">
      <template #extra>
        <el-button type="primary" @click="toHome">Back</el-button>
      </template>
    </el-result>
  </div>
</template>

<script lang="ts" setup>
import {useRouter} from 'vue-router'

const router = useRouter()
const toHome = () => {
  router.push('/')
}
</script>

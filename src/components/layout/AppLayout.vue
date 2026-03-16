<script lang="ts" setup>
import {useTokenStore} from '@/apps/appc_auth/stores/token.ts'

import AppAside from './AppAside.vue'
import AppHeader from './AppHeader.vue'

const router = useRouter()
const tokenStore = useTokenStore()

const isCollapse = ref(false)
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

if (!tokenStore.isAuthenticated) {
  router.push('/login')
}
</script>

<template>
  <div class="app-layout">
    <el-container>
      <AppAside :isCollapse="isCollapse"></AppAside>
      <el-container class="app-layout-content">
        <AppHeader :isCollapse="isCollapse" :toggleCollapse="toggleCollapse"></AppHeader>
        <el-scrollbar>
          <el-main>
            <RouterView/>
          </el-main>
        </el-scrollbar>
        <el-footer>Footer</el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.app-layout-content {
  flex-direction: column;
}
</style>

<template>
  <div class="investment-layout">
    <!-- 简单的页面头部 -->
    <header v-if="showHeader" class="layout-header">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <router-link to="/investment/backtest/tasks" class="text-xl font-bold">
              投资回测系统
            </router-link>
            <nav class="ml-8">
              <router-link
                to="/investment/backtest/tasks"
                class="px-3 py-2 rounded-md text-sm font-medium"
                active-class="bg-blue-100 text-blue-700"
              >
                任务列表
              </router-link>
            </nav>
          </div>
          <div class="flex items-center gap-2">
            <el-button type="primary" link @click="handleBackToHome">
              返回首页
            </el-button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="layout-main">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer v-if="showFooter" class="layout-footer">
      <div class="container mx-auto px-6 py-4 text-center text-gray-500 text-sm">
        © 2026 投资回测系统 - 仅供学习使用
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

interface Props {
  showHeader?: boolean
  showFooter?: boolean
}

withDefaults(defineProps<Props>(), {
  showHeader: true,
  showFooter: true,
})

const router = useRouter()

const handleBackToHome = () => {
  router.push('/')
}
</script>

<style scoped>
@reference "tailwindcss";

.investment-layout {
  @apply min-h-screen flex flex-col;
}

.layout-header {
  @apply border-b bg-white shadow-sm;
}

.layout-main {
  @apply flex-1 p-6 bg-gray-50;
}

.layout-footer {
  @apply border-t bg-white;
}
</style>
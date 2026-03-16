<script setup lang="ts">
import { useTokenStore } from '@/stores/token'
import type { UserGet } from '@/apps/appc_auth/types'
import { useUserStore } from '@/apps/appc_auth/stores/user'

const router = useRouter()
const tokenStore = useTokenStore()
const userStore = useUserStore()
const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false,
  },
  toggleCollapse: {
    type: Function,
  },
})

let userInfo = reactive({
  id: userStore.id,
  username: userStore.username,
  nickname: userStore.nickname,
  phone: userStore.phone,
  email: userStore.email,
  avatar: '',
})

const onLogout = async () => {
  userStore.clear()
  tokenStore.clear()
  await router.push({ path: '/login' })
}
</script>

<template>
  <el-header>
    <!-- 收缩图标 -->
    <el-icon @click="toggleCollapse">
      <IEpExpand v-show="isCollapse" />
      <IEpFold v-show="!isCollapse" />
    </el-icon>

    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">homepage</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">promotion management</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>promotion list</el-breadcrumb-item>
      <el-breadcrumb-item>promotion detail</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 下拉菜单 -->
    <el-dropdown>
      <el-avatar
        :size="32"
        :src="'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
      />
      <span class="el-dropdown-link">
        <el-icon class="el-icon--right">
          <IEpArrowDown />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>
            <span>{{ userInfo.nickname }}</span>
            <span>({{ userInfo.username }})</span>
          </el-dropdown-item>
          <el-dropdown-item>{{ userInfo.phone }}</el-dropdown-item>
          <el-dropdown-item>{{ userInfo.email }}</el-dropdown-item>
          <el-dropdown-item divided @click="onLogout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-header>
</template>

<style lang="scss" scoped>
.el-header {
  display: flex;
  align-items: center;
  background-color: #eee;

  .el-icon {
    margin-right: 17px;
  }
}

.el-dropdown {
  margin-left: auto;
}
</style>

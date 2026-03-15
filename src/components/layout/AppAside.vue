<script lang="ts" setup>
const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <el-aside>
    <el-scrollbar>
      <el-menu :collapse="isCollapse" router unique-opened>
        <a class="logo" href="/">
          <!-- <img src="assets/images/favicon.ico"></img> -->
          <h1>AI-Life</h1>
        </a>

        <el-sub-menu index="1">
          <template #title>
            <el-icon>
              <IEpTools/>
            </el-icon>
            <span> 权限管理 </span>
          </template>
          <el-menu-item index="/auth/admin/users">
            <el-icon>
              <IEpUserFilled/>
            </el-icon>
            <span> 用户管理 </span>
          </el-menu-item>
          <el-menu-item index="/auth/admin/roles">
            <el-icon>
              <IEpAvatar/>
            </el-icon>
            <span> 角色管理 </span>
          </el-menu-item>
          <el-menu-item index="/auth/admin/resource">
            <el-icon>
              <IEpMenu/>
            </el-icon>
            <span> 资源管理 </span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="2">
          <template #title>
            <el-icon>
              <IEpSetting/>
            </el-icon>
            <span> 系统管理 </span>
          </template>
          <el-menu-item index="/auth/admin/users">
            <el-icon>
              <IEpSetting/>
            </el-icon>
            <span> 配置管理 </span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="3">
          <template #title>
            <el-icon>
              <IEpSetting/>
            </el-icon>
            <span> 日常跟踪 </span>
          </template>
          <el-menu-item index="/daily-tracker/dashboard">
            <el-icon>
              <IEpSetting/>
            </el-icon>
            <span> 数据大盘 </span>
          </el-menu-item>
          <el-menu-item index="/daily-tracker/time-spend">
            <el-icon>
              <IEpSetting/>
            </el-icon>
            <span> 时间花费 </span>
          </el-menu-item>
          <el-menu-item index="/daily-tracker/dashboard">
            <el-icon>
              <IEpSetting/>
            </el-icon>
            <span> 计划安排 </span>
          </el-menu-item>
          <el-menu-item index="/daily-tracker/action/data">
            <el-icon>
              <IEpSetting/>
            </el-icon>
            <span> 行为数据 </span>
          </el-menu-item>
          <el-menu-item index="/daily-tracker/thing/data">
            <el-icon>
              <IEpSetting/>
            </el-icon>
            <span> 事情数据 </span>
          </el-menu-item>
          <el-menu-item index="/daily-tracker/tag/data">
            <el-icon>
              <IEpSetting/>
            </el-icon>
            <span> 标签数据 </span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="4">
          <template #title>
            <el-icon>
              <IEpSetting/>
            </el-icon>
            <span> 组件实例 </span>
          </template>
          <el-menu-item index="/example/button">
            <el-icon>
              <IEpSetting/>
            </el-icon>
            <span> Button </span>
          </el-menu-item>
          <el-menu-item index="/example/input">
            <el-icon>
              <IEpSetting/>
            </el-icon>
            <span> Input </span>
          </el-menu-item>
          <el-menu-item index="/example/select">
            <el-icon>
              <IEpSetting/>
            </el-icon>
            <span> Select </span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<style lang="scss" scoped>
.el-aside {
  background-color: #eee;
  height: 100vh;
  width: auto;
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  color: black;
  height: 60px;

  img {
    width: 32px;
    height: 32px;
  }
}

.el-menu {
  background-color: #eee;
  border-right: none;
  width: 200px;

  &.el-menu--collapse {
    width: 60px;

    & h1 {
      display: none;
    }
  }
}
</style>

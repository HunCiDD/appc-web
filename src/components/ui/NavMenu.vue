<script lang="ts" setup></script>

<template>
  <div>
    <el-row class="tac">
      <el-col :span="12">
        <el-menu
          active-text-color="#ffd04b"
          background-color="#545c64"
          class="el-menu-vertical-demo"
          default-active="2"
          router
          text-color="#fff"
        >
          <el-menu-item index="/daily-tracker">
            <span>日常追踪</span>
          </el-menu-item>
          <el-menu-item index="/admin">
            <el-icon>
              <setting/>
            </el-icon>
            <span>系统管理</span>
          </el-menu-item>
        </el-menu>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import {Setting} from '@element-plus/icons-vue'

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style scoped></style>

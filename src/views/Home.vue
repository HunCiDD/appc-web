<script lang="ts" setup>
const handleClick = () => {
  console.log('Button clicked!')
}
</script>

<template>
  <div>首页</div>
  <div>
    <el-icon>
      <Edit/>
    </el-icon>
  </div>
  <el-button type="primary" @click="handleClick">Primary</el-button>
</template>

<style scoped></style>

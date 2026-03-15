<script lang="ts" setup>
const handleClick = () => {
  console.log('Button clicked!')
  ElMessage('This is a message.')
}
</script>

<template>
  <div>about</div>
  <div>
    <el-icon :size="20">
      <IEpEdit/>
    </el-icon>
    <el-icon class="no-inherit" color="#409efc">
      <IconShare/>
    </el-icon>
  </div>
  <el-button type="primary" @click="handleClick">Primary</el-button>
</template>

<style scoped></style>

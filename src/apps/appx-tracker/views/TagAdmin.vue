<!-- src/components/TagManagement.vue -->
<template>
  <div class="tag-management-container">
    <!-- 条件查询区域 -->
    <h1>条件查询</h1>
    <el-button @click="submitForm">取消</el-button>

    <!-- 数据表格 -->
    <h2>数据表格</h2>
  </div>
</template>

<script lang="ts" setup>
import {getTag, listTags} from '../apis/tags.ts'

const submitForm = async () => {
  getTag('189710a0-21dd-506e-a688-c74fb81d4b21')
  let r = listTags()
  console.log(r)
}

</script>

<style scoped>
.tag-management-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>

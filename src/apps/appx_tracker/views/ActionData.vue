<!--
 * new page
 * @author: HunCiDD
 * @since: 2025-10-22
 * ActionData.vue
-->
<script lang="ts" setup>
const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office',
  },
]
</script>

<template>
  <div class="action-data">
    <h1>xx</h1>

    <el-table :data="tableData" style="width: 100%">
      <el-table-column fixed label="Date" prop="date" width="150" />
      <el-table-column label="Name" prop="name" width="120" />
      <el-table-column label="State" prop="state" width="120" />
      <el-table-column label="City" prop="city" width="120" />
      <el-table-column label="Address" prop="address" width="600" />
      <el-table-column label="Zip" prop="zip" width="120" />
      <el-table-column fixed="right" label="Operations" min-width="120">
        <template #default>
          <el-button link size="small" type="primary" @click="handleClick"> Detail </el-button>
          <el-button link size="small" type="primary">Edit</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped></style>

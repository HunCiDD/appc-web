<script lang="ts" setup>
import type {PropType} from 'vue'
import type {TableOptions} from '@/components/types/table.ts'

const props = defineProps({
  options: {
    type: Array as PropType<TableOptions[]>,
    required: true
  },
  // 表格数据
  data: {
    type: Array as PropType<any[]>,
    required: true
  }
})

// 过滤操作选项之后的配置
const tableOptions = computed(() => props.options?.filter(item => !item.action))


// 操作项配置
const actionOption = computed(() => props.options?.find(item => item.action))

// 表格是否在加载中
const isLoading = computed(() => !props.data || !props.data.length)

</script>

<template>

  <el-table v-loading="isLoading" :data="data">
    <template v-for="(item, i) in tableOptions" :key="i">
      <el-table-column
        v-if="!item.slot"
        :align="item.align"
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
      ></el-table-column>
      <el-table-column
        v-else
        :align="item.align"
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
      >
        <template #default="scope">
          <slot :name="item.slot" :scope="scope"></slot>
        </template>
      </el-table-column>
    </template>

    <el-table-column
      :align="actionOption!.align"
      :label="actionOption!.label"
      :width="actionOption!.width"
    >
      <template #default="scope">
        <slot :scope="scope" name="action"></slot>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>

</style>



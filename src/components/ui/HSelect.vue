<script lang="ts" setup>


import type {PropType} from 'vue'
import type {EpSizeType, SelectOptions} from '@/components/types/ui.ts'

const props = defineProps({
  size: {
    type: String as PropType<EpSizeType>,
    default: 'default',
  },
  value: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  options: {
    type: Array as PropType<SelectOptions[]>,
    required: true
  }
})

</script>

<template>
  <el-select v-model="props.value" :placeholder="props.placeholder" :size="props.size"
             v-bind="$attrs">
    <el-option
      v-for="item in props.options"
      :key="item.id || item.value"
      :disabled="item.disabled"
      :label="item.label"
      :value="item.value"
    />
    <template v-for="(slot, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps"></slot>
    </template>
  </el-select>
</template>

<style scoped>

</style>

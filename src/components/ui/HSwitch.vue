<template>
  <el-switch
    :active-text="activeText"
    :inactive-text="inactiveText"
    :model-value="modelValue"
    :size="size"
    :style="style"
    v-bind="$attrs"
    @change="handleNativeChange"
    @update:model-value="handleUpdateModelValue"
  />
</template>

<script lang="ts" setup>
import {computed, type CSSProperties} from 'vue'

interface SwitchOption {
  modelValue?: boolean
  size?: BaseSize
  activeText?: string
  inactiveText?: string
  style?: CSSProperties
}

type BaseSize = 'large' | 'default' | 'small'

const props = withDefaults(defineProps<SwitchOption>(), {
  size: 'default',
  activeText: '',
  inactiveText: '',
  style: () => ({}),
  modelValue: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const size = computed(() => {
  const validSizes = ['large', 'default', 'small']
  return validSizes.includes(props.size) ? props.size : 'default'
})

// 处理 v-model 更新
const handleUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value)
}

// 处理业务逻辑 change 事件
const handleNativeChange = (value: boolean) => {
  emit('change', value)
}
</script>

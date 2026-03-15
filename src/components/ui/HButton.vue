<script lang="ts" setup>
import type {Component as ComponentType, PropType} from 'vue'
import {CirclePlus, Delete, Download, Edit, Search, Upload} from '@element-plus/icons-vue'
import type {ButtonType, CustomButtonType, EpButtonType, EpSizeType} from '../types/ui'
import {CUSTOM_BUTTON_TYPES} from '../types/ui'


const props = defineProps({
  type: {
    type: String as PropType<ButtonType>,
    default: 'default'
  },
  size: {
    type: String as PropType<EpSizeType>,
    default: 'default'
  },
  icon: {
    type: [Object, String] as PropType<ComponentType | string>,
    default: ''
  },
  disabled: {type: Boolean, default: false},
  loading: {type: Boolean, default: false},
  debounce: {type: Number, default: 0},
})

// 自定义类型到Element Plus类型的映射
const type_maps: Record<CustomButtonType, [EpButtonType, ComponentType]> = {
  add: ['primary', CirclePlus],
  edit: ['primary', Edit],
  delete: ['danger', Delete],
  search: ['primary', Search],
  download: ['primary', Download],
  upload: ['primary', Upload],
}

const computedProps = computed(() => {
  const {type, icon} = props

  if (CUSTOM_BUTTON_TYPES.includes(type as CustomButtonType)) {
    // 获取自定义类型对应的Element Plus类型和图标
    const [elementType, elementIcon] = type_maps[type as CustomButtonType]
    return {type: elementType, icon: icon || elementIcon}
  } else {
    // 当type不是自定义类型时，确保返回的是EpButtonType
    return {type: type as EpButtonType, icon}
  }
})

const attrs = useAttrs()

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const lastClickTime = ref(0)
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return
  // 防止按钮被频繁点击
  if (props.debounce && props.debounce > 0) {
    const now = Date.now()
    if (now - lastClickTime.value > props.debounce) {
      lastClickTime.value = now
      emit('click', event)
    }
    return
  }
  emit('click', event)
}
</script>

<template>
  <div class="h-button">
    <el-button
      :icon="computedProps.icon"
      :size="props.size"
      :type="computedProps.type"
      v-bind="$attrs"
      @click="handleClick"
    >
      <slot></slot>
    </el-button>
  </div>
</template>

<style scoped></style>

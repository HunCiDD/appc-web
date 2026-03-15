<!--
 * new page
 * @author: HunCiDD
 * @since: 2025-10-18
 * HInput.vue
-->
<script lang="ts" setup>
import type {PropType} from 'vue';
import type {CustomInputType, EpSizeType, InputType} from '../types/ui';
import {CUSTOM_INPUT_TYPES} from '../types/ui';


const props = defineProps({
  type: {
    type: String as PropType<InputType>,
    default: 'text',
    required: true,
  },
  size: {
    type: String as PropType<EpSizeType>,
    default: 'default',
  },
  value: {
    type: [String, Number],
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
})

const isCustomType = computed(() => {
  return CUSTOM_INPUT_TYPES.includes(props.type as CustomInputType);
})


</script>

<template>
  <div class="h-input">
    <template>
      <div class="h-input">
        <template v-if="isCustomType">
          <el-input-number
            v-model="props.value"
            :size="props.size"
            v-bind="$attrs"
          >
            <template v-for="(slot, slotName) in $slots" #[slotName]="slotProps">
              <slot :name="slotName" v-bind="slotProps"></slot>
            </template>
          </el-input-number>
        </template>
        <template v-else>
          <el-input
            v-model="props.value"
            :placeholder="props.placeholder"
            :size="props.size"
            :type="props.type"
            v-bind="$attrs"
          >
            <template v-for="(slot, slotName) in $slots" #[slotName]="slotProps">
              <slot :name="slotName" v-bind="slotProps"></slot>
            </template>
          </el-input>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped></style>

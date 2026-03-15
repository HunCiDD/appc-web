// Form.vue
<script lang="ts" setup>
import {defineProps, type PropType} from 'vue'
import type {FormOptions} from '@/components/types/form.ts'
import {cloneDeep} from 'lodash'
import type {FormInstance} from 'element-plus'


const props = defineProps({
  labelWidth: {
    type: String,
    default: '120px',
  },
  // 表单的配置项
  formOptions: {
    type: Array as PropType<FormOptions[]>,
    required: true
  }
})

let formModel = ref<any>(null)
let formRules = ref<any>(null)
let formRef = ref<FormInstance>()

const initForm = () => {
  if (props.formOptions && props.formOptions.length) {
    let m: any = {}
    let r: any = {}

    props.formOptions.map((item: FormOptions) => {
      m[item.prop!] = item.value
      r[item.prop!] = item.rules
    })

    formModel.value = cloneDeep(m)
    formRules.value = cloneDeep(r)
  }
}

onMounted(() => {
  initForm()
})

// 监听父组件传递进来的options
watch(() => props.formOptions, () => {
  initForm()
}, {deep: true})


</script>

<template>

  <slot name="head"></slot>
  <el-form
    v-if="formModel"
    ref="formRef"
    :label-width="labelWidth"
    :model="formModel"
    :rules="formRules"
    :validate-on-rule-change="false"
  >

    <template v-for="(item, i) in formOptions" :key="i">
      <el-form-item :label="item.label" :prop="item.prop">

        <template v-if="item.type === 'input-password'">
          <el-input
            v-model="formModel[item.prop]"
            :placeholder="item.placeholder"
            type="password"
            v-bind="item.attrs"
          ></el-input>
        </template>
        <template v-if="item.type === 'input-textarea'">
          <el-input
            v-model="formModel[item.prop]"
            :placeholder="item.placeholder"
            type="textarea"
            v-bind="item.attrs"
          ></el-input>
        </template>

        <!--   处理下拉选项   -->
        <template v-else-if="item.type === 'select'">
          <el-select
            v-model="formModel[item.prop]"
            :placeholder="item.placeholder"
            v-bind="item.attrs"
          >
            <template v-if="item.children && item.children.length">
              <template v-for="(child, j) in item.children" :key="j">
                <template v-if="child.type === 'option'">
                  <el-option :label="child.label" :value="child.value"></el-option>
                </template>
              </template>
            </template>
          </el-select>
        </template>

        <!--   处理多选选项   -->
        <template v-else-if="item.type === 'checkbox-group'">
          <el-checkbox-group
            v-model="formModel[item.prop]"
            :placeholder="item.placeholder"
            v-bind="item.attrs"
          >
            <template v-for="(child, j) in item.children" :key="j">
              <template v-if="child.type === 'checkbox'">
                <el-checkbox :label="child.label" :value="child.value"></el-checkbox>
              </template>
            </template>
          </el-checkbox-group>
        </template>

        <!--   处理单选项选项   -->
        <template v-else-if="item.type === 'radio-group'">
          <el-radio-group
            v-model="formModel[item.prop]"
            :placeholder="item.placeholder"
            v-bind="item.attrs"
          >
            <template v-for="(child, j) in item.children" :key="j">
              <template v-if="child.type === 'radio'">
                <el-radio :label="child.label" :value="child.value"></el-radio>
              </template>
            </template>
          </el-radio-group>
        </template>

        <template v-else>
          <component
            :is="`el-${item.type}`"
            v-model="formModel[item.prop]"
            v-bind="item.attrs"
          ></component>
        </template>

      </el-form-item>
    </template>

    <slot :form="formRef" :model="formModel" name="action"></slot>

  </el-form>

</template>

<style scoped>

</style>

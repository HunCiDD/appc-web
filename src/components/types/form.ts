// 可配置的表单
import type {RuleItem} from '@/components/types/rule.ts'
import type {CSSProperties} from 'vue'
import type {FormInstance} from 'element-plus'

export interface FormOptions {
  // 表单项显示的元素
  type: 'cascader' | 'checkbox' | 'checkbox-group' | 'color-picker'
    | 'date-picker' | 'time-picker' | 'time-select' | 'transfer'
    | 'input' | 'input-number' | 'input-password' | 'input-textarea' | 'radio-group' | 'radio'
    | 'rate' | 'select' | 'option' | 'slider ' | 'switch' | 'upload',

  value: any,
  label?: string,
  // 验证规则
  prop?: any
  placeholder?: string,
  rules?: RuleItem[],
  // 表单元素特有属性
  attrs?: {
    clearable?: boolean
    showPassword?: boolean
    disabled?: boolean
    style?: CSSProperties
  },
  children?: FormOptions[]
}


export interface FormConfig {
  'labelWidth': string,
  'formOptions': FormOptions[]
}


export interface FormScope {
  form: FormInstance,
  model: any
}


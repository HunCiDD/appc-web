import type {CSSProperties} from 'vue'
import type {RuleItem} from './rule'


export const EP_SIZE_TYPES = ['large', 'small'] as const;
export const EP_ALIGN_TYPES = ['left', 'center', 'right'] as const;
export const EP_BUTTON_TYPES = ['primary', 'success', 'warning', 'danger', 'info', 'text', 'default'] as const;
export const EP_INPUT_TYPES = ['text', 'password', 'textarea'] as const;
export const CUSTOM_BUTTON_TYPES = ['add', 'edit', 'delete', 'search', 'download', 'upload'] as const;
export const CUSTOM_INPUT_TYPES = ['number', 'decimal', 'amount', 'url', 'phone', 'email'] as const;

export type EpSizeType = typeof EP_SIZE_TYPES[number];
export type EpAlignType = typeof EP_ALIGN_TYPES[number];
export type EpButtonType = typeof EP_BUTTON_TYPES[number];
export type EpInputType = typeof EP_INPUT_TYPES[number];

export type CustomButtonType = typeof CUSTOM_BUTTON_TYPES[number];
export type CustomInputType = typeof CUSTOM_INPUT_TYPES[number];

export type ButtonType = EpButtonType | CustomButtonType
export type InputType = EpInputType | CustomInputType

export interface BaseAttrs {
  disabled?: boolean
  style?: CSSProperties
}


/**
 * 基础组建配置
 */
export interface BaseOptions {
  type: string
  value: any
  placeholder?: string
  label?: string
  size?: EpSizeType
  prop?: any
  rules?: RuleItem[]
  attrs?: BaseAttrs
}

/**
 * 按钮组件属性配置
 */
export interface ButtonAttrs extends BaseAttrs {
  icon?: any
  text?: boolean
  circle?: boolean
  round?: boolean
  color?: string
  debounce?: number
  loading?: boolean
}

/**
 * 按钮组件配置
 */
export interface ButtonOptions extends BaseOptions {
}

/**
 * 输入框组件属性配置
 */
export interface InputAttrs extends BaseAttrs {
  clearable?: boolean
  showPassword?: boolean
  rows?: number
  autoSize?: boolean | { minRows: number; maxRows: number }
  suffixIcon?: any
  prefixIcon?: any
  minLength?: number
  maxLength?: number
  showWordLimit?: boolean
}

/**
 * 输入框组件配置
 */
export interface InputOptions extends BaseOptions {
  type: InputType,
  attrs?: InputAttrs
}


/**
 * 下拉选择框组件配置
 */
export interface SelectOptions {
  label: string
  value: string
  id?: string
  disabled?: boolean
}

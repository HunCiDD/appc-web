export interface TableOptions {
  // 表头
  label: string,
  // 字段名称
  prop?: string,
  width?: string | number,
  // 对齐
  align?: 'left' | 'right' | 'center',
  // 是否为操作列
  action?: boolean,
  // 自定义内容
  slot?: string
}

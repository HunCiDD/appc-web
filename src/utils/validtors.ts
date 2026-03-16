
/**
 * @description 判断数据类型
 * @param value
 * @param type
 * @returns
 */
export function isTypeof(value: unknown, type: string): boolean {
  return typeof value === type
}

/**
 * @description 判断是否是函数
 * @param value
 * @returns
 */
export function isFunction(value: unknown): boolean {
  return isTypeof(value, 'function')
}

/**
 * 对象的键重命名
 * @param obj
 * @param keyMap
 */
export const renameObjectKeys = (obj: any, keyMap: Record<string, string>): any => {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = keyMap[key] || key
    acc[newKey] = obj[key]
    return acc
  }, {} as any)
}

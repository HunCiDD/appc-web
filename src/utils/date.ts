/**
 * 获取今天开始的时间
 */
export const todayStartDate = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

/**
 * 获取今天结束的时间
 */
export const todayEndDate = () => {
  const date = new Date()
  date.setHours(23, 59, 59, 999)
  return date
}

/**
 * 转换日期
 */
export const convertToDate = (date: number | string) => {
  if (typeof date === 'number') {
    // 处理时间戳（秒或毫秒）
    return date < 1e10 ? new Date(date * 1000) : new Date(date)
  } else {
    return new Date(date)
  }
}

/**
 * 格式化日期
 */
export const formatDate = (date: Date, format = 'YYYY-MM-DD') => {
  if (isNaN(date.getTime())) {
    console.warn('Invalid date passed to formatDate')
    return ''
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  const milliseconds = date.getMilliseconds()

  // 按优先级顺序定义替换规则（长格式优先）
  const replacements: { [key: string]: string } = {
    YYYY: year.toString(),
    YY: year.toString().slice(-2),
    MM: month.toString().padStart(2, '0'),
    M: month.toString(),
    DD: day.toString().padStart(2, '0'),
    D: day.toString(),
    HH: hours.toString().padStart(2, '0'),
    H: hours.toString(),
    mm: minutes.toString().padStart(2, '0'),
    m: minutes.toString(),
    ss: seconds.toString().padStart(2, '0'),
    s: seconds.toString(),
    SSS: milliseconds.toString().padStart(3, '0'),
    S: milliseconds.toString(),
  }

  // 使用正则表达式进行替换（按长度降序匹配）
  return format.replace(/YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g, (match) => replacements[match])
}

/**
 * 时区转换函数
 */
export const convertToTimezone = (date: Date, timeZone: string) => {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

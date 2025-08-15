/**
 * 时间格式化工具函数
 */

/**
 * 解析日期字符串
 * @param {string} dateStr - 日期字符串，格式如："2025-11-04 23:11:01"
 * @returns {Date|null} - 返回Date对象或null（解析失败时）
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null

  const parts = dateStr.match(/\d+/g)
  if (!parts || parts.length < 6) return null

  const date = new Date(
    parts[0], // 年
    parts[1] - 1, // 月（JS 的月份从 0 开始）
    parts[2], // 日
    parts[3], // 时
    parts[4], // 分
    parts[5], // 秒
  )

  return isNaN(date.getTime()) ? null : date
}

/**
 * 格式化时间显示（天/时/分）
 * @param {number} timeValue - 时间值（分）
 * @returns {string} 格式化后的时间字符串
 */
export const formatTimeDisplay = (timeValue) => {
  if (!timeValue) return '0分'

  // timeValue 是以分为单位
  const totalMinutes = timeValue
  const days = Math.floor(totalMinutes / (24 * 60))
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
  const minutes = Math.floor(totalMinutes % 60)

  let result = ''
  if (days > 0) result += `${days}天`
  if (hours > 0) result += `${hours}时`
  if (minutes > 0) result += `${minutes}分`

  return result || '0分'
}

/**
 * 格式化截止时间
 * @param {string} endTime - 截止时间字符串
 * @returns {string} 格式化后的截止时间
 */
export const formatDeadline = (endTime) => {
  if (!endTime) return ''

  const date = parseDate(endTime)
  if (!date) return endTime

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${year}/${month}/${day} ${hour}:${minute}`
}

/**
 * 格式化已完成时间显示
 * @param {string} startTime - 开始时间
 * @param {string} endTime - 结束时间
 * @returns {string} 格式化后的完成时间范围
 */
export const formatCompletedTime = (startTime, endTime) => {
  if (!startTime || !endTime) return ''

  const startDate = parseDate(startTime)
  const endDate = parseDate(endTime)

  if (!startDate || !endDate) return ''

  const startMonth = String(startDate.getMonth() + 1).padStart(2, '0')
  const startDay = String(startDate.getDate()).padStart(2, '0')
  const startHour = String(startDate.getHours()).padStart(2, '0')
  const startMinute = String(startDate.getMinutes()).padStart(2, '0')

  const endMonth = String(endDate.getMonth() + 1).padStart(2, '0')
  const endDay = String(endDate.getDate()).padStart(2, '0')
  const endHour = String(endDate.getHours()).padStart(2, '0')
  const endMinute = String(endDate.getMinutes()).padStart(2, '0')

  return `${startMonth}/${startDay} ${startHour}:${startMinute} ~ ${endMonth}/${endDay} ${endHour}:${endMinute} 完成`
}

/**
 * 格式化倒计时显示（天 + HH:MM:SS）
 * @param {number} totalSeconds - 总秒数
 * @returns {string} 格式化后的倒计时
 */
export const formatCountdown = (totalSeconds) => {
  if (totalSeconds <= 0) return '00:00:00'

  const days = Math.floor(totalSeconds / (24 * 60 * 60))
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  const timeStr = ` <span class="slaStatus">${String(hours).padStart(2, '0')}</span>:<span class="slaStatus">${String(minutes).padStart(2, '0')}</span>:<span class="slaStatus">${String(seconds).padStart(2, '0')}</span>`

  return days > 0 ? `${days}天 ${timeStr}` : timeStr
}

/**
 * 格式化持续时间显示（天/时/分/秒）
 * @param {number} totalSeconds - 总秒数
 * @returns {string} 格式化后的持续时间
 */
export const formatDuration = (totalSeconds) => {
  if (totalSeconds <= 0) return '0秒'

  const days = Math.floor(totalSeconds / (24 * 60 * 60))
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  let result = ''
  if (days > 0) result += `${days}天`
  if (hours > 0) result += `${hours}时`
  if (minutes > 0) result += `${minutes}分`
  // if (seconds > 0) result += `${seconds}秒`

  return result || '0秒'
}

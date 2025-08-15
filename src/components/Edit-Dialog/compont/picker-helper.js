/**
 * 选择器辅助函数
 * 用于处理选择器选项的不同数据结构
 */

/**
 * 创建兼容的选择器配置
 * 自动检测数据源中是否包含value或id字段，并返回对应的props配置
 * @param {Array} options 选项数组
 * @param {String} labelKey 可选，标签字段名，默认为'label'
 * @returns {Object} 返回适用于lb-picker的props配置
 */
export function createPickerProps(options = [], labelKey = 'label') {
  if (!Array.isArray(options) || options.length === 0) {
    return { label: labelKey, value: 'value' }
  }

  // 检查第一个选项是否包含id字段
  const firstItem = options[0]
  const valueKey = 'id' in firstItem ? 'id' : 'value'

  return {
    label: labelKey,
    value: valueKey,
  }
}

/**
 * 规范化选择器选项数组
 * 将不同格式的选项数组转换为统一格式
 * @param {Array} options 原始选项数组
 * @param {Object} format 目标格式 {labelField, valueField}
 * @returns {Array} 统一格式的选项数组
 */
export function normalizeOptions(options = [], format = { labelField: 'label', valueField: 'value' }) {
  if (!Array.isArray(options)) return []

  return options.map((item) => {
    if (typeof item === 'string') {
      // 如果是字符串数组，转换为对象
      return { [format.labelField]: item, [format.valueField]: item }
    } else if (typeof item === 'object' && item !== null) {
      // 如果已经是对象，检查并确保它有正确的字段
      const result = { ...item }

      // 确保有标签字段
      if (!result[format.labelField] && (result.name || result.title)) {
        result[format.labelField] = result.name || result.title
      }

      // 确保有值字段
      if (!result[format.valueField] && result.id !== undefined) {
        result[format.valueField] = result.id
      }

      return result
    }
    return item
  })
}

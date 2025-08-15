// table 头部 搜索重置
// import _ from 'lodash'
export function projectEditAndAddCommonFn(tablePopData) {
  function updateFormItemOptions(field, options) {
    const formItem = tablePopData.value.formItems.find((item) => item.field === field)
    if (formItem) {
      formItem.options = options
    } else {
      console.error(`Form item with field "${field}" not found.`)
    }
  }
  // 设置 tablePopData.formItems里面的属性
  function updateFormItemAttribute(field, attributeObj) {
    // 遍历formItems数组
    for (let item of tablePopData.value.formItems) {
      // 检查当前item的field是否与传入的field相匹配
      if (item.field === field) {
        // 如果匹配，则使用传入的属性对象来更新当前item的属性
        for (let key in attributeObj) {
          if (attributeObj.hasOwnProperty(key)) {
            item[key] = attributeObj[key]
          }
        }
        break // 找到后退出循环，避免不必要的遍历
      }
    }
  }
  // proxy.$modal.msgError
  // proxy.$modal.msgWarning

  // 使用示例

  return {
    updateFormItemOptions,
    updateFormItemAttribute,
  }
}

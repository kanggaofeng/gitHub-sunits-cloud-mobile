import useDictStore from '@/store/modules/dict'
// import useTagsViewStore from '@/store/modules/tagsView'
import { getDicts } from '@/api/system/dict/data'

/**
 * 获取字典数据
 */
export function useDict(...args) {
  const res = ref({})
  return (() => {
    args.forEach((dictType, index) => {
      res.value[dictType] = []
      const dicts = useDictStore().getDict(dictType)
      if (dicts) {
        res.value[dictType] = dicts
      } else {
        getDicts(dictType).then((resp) => {
          res.value[dictType] = resp.data.map((p) => ({ label: p.dictLabel, value: p.dictValue, elTagType: p.listClass, elTagClass: p.cssClass }))
          useDictStore().setDict(dictType, res.value[dictType])
        })
      }
    })
    return toRefs(res.value)
  })()
}
/**
 * 获取字典数据
 */
export function getAllDict(dictType) {
  const dictsArr = useDictStore().mockAllDictData
  let arr = []
  dictsArr.forEach((dict) => {
    if (dict.dictType == dictType) {
      const obj = ref({})
      dict.dictDataList.forEach((p) => {
        arr.push({ label: p.dictLabel, value: p.dictValue, elTagType: p.listClass, elTagClass: p.cssClass, remark: p.remark })
      })
    }
  })
  return arr
}

// 获取项目
export function getAllProjects(dictType) {
  if (useDictStore().xiangMuDataVx.length > 0) {
    return useDictStore().xiangMuDataVx
  } else {
    return useDictStore().getAllProgectvxFn()
  }
}
// 获取城市
export function getAllCity() {
  if (useDictStore().cityAllVx.length > 0) {
    return useDictStore().cityAllVx
  } else {
    return useDictStore().getAllCityvxFn()
  }
}

// 生成一个8位密码

export function generatePassword(length = 8) {
  // 定义可能包含的字符集
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const specialChars = '-@$!%*?&#' // 特殊字符集

  // 确保密码至少包含一个字母、一个数字和一个特殊字符
  let password = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)],
  ].join('')

  // 如果需要更长的密码，随机选择字符填充
  const allChars = lowercase + uppercase + numbers + specialChars
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // 打乱密码数组，以确保字符的随机分布
  const shuffledPassword = password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('')

  return shuffledPassword
}

// 简单实现defineComponentTitleFn函数
export function defineComponentTitleFn(title) {
  return title
}

// 数组转 key-value 对象，支持递归遍历 children
export function arrayToMap(arr, key, value) {
  const map = new Map()

  function traverse(items) {
    items.forEach((item) => {
      map.set(item[key], item[value])
      if (item.children && Array.isArray(item.children)) {
        traverse(item.children) // 递归遍历子级
      }
    })
  }

  traverse(arr.value)
  return map
}

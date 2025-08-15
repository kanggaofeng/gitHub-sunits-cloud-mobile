import { useUserStore } from '@/store/modules/user'
import useDictStore from '@/store/modules/dict'
import { getToken, setToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { toast, showConfirm, tansParams } from '@/utils/common'
import { refreshToken } from '@/api/login'
import config from '@/config'

// 请求超时时间，单位：毫秒
let timeout = 10000

// token相关变量
let isRefreshing = false // 是否正在刷新token
let requests = [] // token刷新时，暂存待重试的请求

// 用于存储正在进行的请求，防止重复提交
// key: 请求的唯一标识（url + method + data）
// value: 请求的时间戳
const pendingMap = new Map()

// 根据环境标识获取对应的baseUrl
const getEnvBaseUrl = (apiPrefix) => {
  const envConfig = Object.values(config.api.env).find((env) => env.apiPrefix === apiPrefix)
  return envConfig ? envConfig.baseUrl : config.api.env.development.baseUrl
}

/**
 * 生成请求的唯一标识
 * @param {Object} config 请求配置
 * @returns {string} 由 url、method 和 data 组成的唯一标识字符串
 * 例如：'/api/login&POST&{"username":"admin","password":"123456"}'
 */
const getRequestKey = (config) => {
  const { url, method, data } = config
  let requestData = data
  // 如果data是字符串，尝试解析成对象（有些请求可能会传字符串形式的JSON）
  if (typeof data === 'string') {
    try {
      requestData = JSON.parse(data)
    } catch (e) {
      requestData = data
    }
  }
  return [url, method, JSON.stringify(requestData)].join('&')
}

/**
 * 检查是否存在重复请求
 * @param {Object} config 请求配置
 * @returns {boolean} true表示有重复请求，false表示无重复请求
 *
 * 判断逻辑：
 * 1. 获取请求的唯一标识
 * 2. 如果这个标识已存在于pendingMap中：
 *    - 检查距离上次请求的时间是否小于1秒
 *    - 如果小于1秒，认为是重复请求，返回true
 *    - 如果大于等于1秒，更新时间戳，返回false
 * 3. 如果标识不存在，添加到pendingMap并返回false
 */
const checkPending = (config) => {
  const requestKey = getRequestKey(config)
  if (pendingMap.has(requestKey)) {
    const lastRequestTime = pendingMap.get(requestKey)
    const now = Date.now()
    // 1秒内的重复请求被视为重复提交
    if (now - lastRequestTime < 1000) {
      return true
    }
  }
  // 记录这次请求的时间戳
  pendingMap.set(requestKey, Date.now())
  return false
}

/**
 * 从pendingMap中移除请求记录
 * @param {Object} config 请求配置
 * 在请求完成后调用（无论成功还是失败）
 */
const removePending = (config) => {
  const requestKey = getRequestKey(config)
  pendingMap.delete(requestKey)
}

// 根据平台确定基础URL
let baseUrl = config.api.devBaseUrl
// #ifdef H5
baseUrl = config.api.devBaseUrl
// #endif

// #ifdef APP-PLUS || APP-PLUS-NVUE
baseUrl = getEnvBaseUrl(config.api.devBaseUrl)
// #endif

/**
 * 统一的请求函数
 * @param {Object} config 请求配置
 * 支持的配置项：
 * - url: 请求地址
 * - method: 请求方法，默认为get
 * - data: 请求数据
 * - params: GET请求的查询参数
 * - headers/header: 请求头
 * - timeout: 超时时间
 * - baseUrl: 自定义基础URL
 */
const request = (config) => {
  // 检查是否需要token
  const isToken = (config.headers || {}).isToken === false || (config.header || {}).isToken === false

  // 防重复提交处理（仅针对POST请求）
  if (config.method?.toUpperCase() === 'POST') {
    if (checkPending(config)) {
      return Promise.reject(new Error('请求正在处理中，请勿重复提交'))
    }
  }

  // 处理请求头
  config.header = config.header || {}
  // 添加token到请求头
  if (getToken() && !isToken) {
    config.header['Authorization'] = 'Bearer ' + getToken()
  }

  // 将headers中的配置转移到header中（uniapp中使用header而不是headers）
  if (config.headers) {
    Object.keys(config.headers).forEach((key) => {
      if (key !== 'isToken') {
        config.header[key] = config.headers[key]
      }
    })
  }

  // 处理GET请求的参数
  if (config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.url = url
  }

  // 构建完整的请求URL
  let fullUrl = ''
  if (config.baseUrl) {
    // 使用配置中的自定义baseUrl
    fullUrl = config.baseUrl + config.url
  } else if (config.url.startsWith('http://') || config.url.startsWith('https://')) {
    // 如果是完整的URL，直接使用
    fullUrl = config.url
  } else {
    // 处理baseUrl和url的拼接，避免出现双斜杠
    if (baseUrl.endsWith('/') && config.url.startsWith('/')) {
      fullUrl = baseUrl + config.url.substring(1)
    } else if (!baseUrl.endsWith('/') && !config.url.startsWith('/')) {
      fullUrl = baseUrl + '/' + config.url
    } else {
      fullUrl = baseUrl + config.url
    }
  }

  // 发起请求
  return new Promise((resolve, reject) => {
    uni.request({
      method: config.method || 'get',
      timeout: config.timeout || timeout,
      url: fullUrl,
      data: config.data,
      header: {
        ...config.header,
        'Client-Type': 'mobile-app', // 标识请求来源为移动端
      },
      dataType: 'json',
      success: (response) => {
        // 请求成功后，移除请求记录
        if (config.method?.toUpperCase() === 'POST') {
          removePending(config)
        }

        const res = response
        const code = res.data.code || 200
        const msg = errorCode[code] || res.data.msg || errorCode['default']

        // 处理token过期的情况
        if (code === 401) {
          if (!isRefreshing) {
            // 如果没有正在刷新token，则开始刷新
            isRefreshing = true
            refreshToken()
              .then((res) => {
                if (res.code === 200) {
                  // token刷新成功
                  setToken(res.data.access_token)
                  const userStore = useUserStore()
                  userStore.SET_TOKEN(res.data.access_token)
                  isRefreshing = false

                  // 重新获取字典数据
                  try {
                    const dictStore = useDictStore()
                    Promise.all([dictStore.getAllProgectvxFn(), dictStore.getAllCityvxFn(), dictStore.getallDictData()]).catch((err) => {
                      console.error('刷新字典数据失败:', err)
                    })
                  } catch (e) {
                    console.error('获取字典Store失败:', e)
                  }

                  // 重试队列中的请求
                  requests.forEach((cb) => cb(res.data.access_token))
                  requests = []

                  // 重试当前请求
                  config.header['Authorization'] = 'Bearer ' + res.data.access_token
                  request(config).then(resolve).catch(reject)
                } else {
                  // token刷新失败，退出登录
                  isRefreshing = false
                  const userStore = useUserStore()
                  userStore.LogOut().then(() => {
                    uni.reLaunch({ url: '/pages/login' })
                  })
                  reject('登录已过期，请重新登录')
                }
              })
              .catch(() => {
                isRefreshing = false
                const userStore = useUserStore()
                userStore.LogOut().then(() => {
                  uni.reLaunch({ url: '/pages/login' })
                })
                reject('刷新Token失败')
              })
          } else {
            // 如果正在刷新token，将请求加入队列
            requests.push((token) => {
              config.header['Authorization'] = 'Bearer ' + token
              request(config).then(resolve).catch(reject)
            })
          }
        } else if (code === 500) {
          // 服务器错误
          toast(msg)
          reject('500')
        } else if (code !== 200) {
          // 其他业务错误
          toast(msg)
          reject(code)
        }
        // 请求成功
        resolve(res.data)
      },
      fail: (error) => {
        // 请求失败后，移除请求记录
        if (config.method?.toUpperCase() === 'POST') {
          removePending(config)
        }

        // 处理错误信息
        let message = error.errMsg || '请求失败'
        if (message.includes('timeout')) {
          message = '系统接口请求超时'
        } else if (message.includes('request:fail')) {
          message = '后端接口连接异常: ' + message
        } else if (message.includes('Request failed with status code')) {
          message = '系统接口' + message.substr(message.length - 3) + '异常'
        }
        toast(message)
        reject(error)
      },
    })
  })
}

export default request

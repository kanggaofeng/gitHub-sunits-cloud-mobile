import { ref, computed, watch, onMounted } from 'vue'
import OSS from 'ali-oss'
import { getOssToken, getPolicyBase64, getSignature } from '@/api/sys-file/ossAPI'
import { getOssPathAndName } from '@/api/sys-file/ossAPI'
import { batchSaveSysFile, getFilesByIds } from '@/api/sys-file/sysFileAPI'

// OSS Token 缓存相关
const OSS_TOKEN_CACHE_KEY = 'ossTokenCache'
const OSS_TOKEN_EXPIRES = 3600000 // Token有效期1时(毫秒)

// 从本地存储获取缓存的Token
const getCachedOssToken = () => {
  const cachedData = uni.getStorageSync(OSS_TOKEN_CACHE_KEY)
  if (cachedData) {
    try {
      const tokenData = JSON.parse(cachedData)
      const now = new Date().getTime()
      if (tokenData.createTime && now - tokenData.createTime < OSS_TOKEN_EXPIRES) {
        return tokenData
      }
    } catch (e) {
      console.error('解析缓存的Token失败:', e)
    }
  }
  return null
}

// 获取新的Token并缓存
const fetchAndCacheOssToken = async () => {
  try {
    const res = await getOssToken()
    if (res?.code !== 200 || !res.data) {
      throw new Error('获取OSS Token失败')
    }

    const tokenData = {
      ...res.data,
      createTime: new Date().getTime(),
    }

    uni.setStorageSync(OSS_TOKEN_CACHE_KEY, JSON.stringify(tokenData))
    return tokenData
  } catch (error) {
    console.error('获取OSS Token失败:', error)
    uni.showToast({ title: '获取上传凭证失败', icon: 'none' })
    throw error
  }
}

// 获取OSS客户端
export const getOSSClient = async () => {
  let ossToken = getCachedOssToken()
  if (!ossToken) {
    ossToken = await fetchAndCacheOssToken()
  }
  return new OSS({
    region: ossToken.region,
    accessKeyId: ossToken.accessKeyId,
    accessKeySecret: ossToken.accessKeySecret,
    stsToken: ossToken.stsToken,
    bucket: ossToken.bucket,
    refreshSTSToken: async () => {
      const refreshedToken = await fetchAndCacheOssToken()
      return {
        accessKeyId: refreshedToken.accessKeyId,
        accessKeySecret: refreshedToken.accessKeySecret,
        stsToken: refreshedToken.stsToken,
      }
    },
    refreshSTSTokenInterval: 300000,
  })
}
// 上传文件到服务器
export const uploadFiles = async (screenshots, moduleName) => {
  try {
    uni.showLoading({ title: '上传中...', mask: true })
    let uploadPromises = null
    let results = null
    let filesToUpload = null
    const ossClient = await getOSSClient()

    // #ifdef H5
    filesToUpload = [base64ToFile(screenshots.tempFilePath, 'avatar')]
    uploadPromises = filesToUpload.map((file) => uploadSingleFile(file, ossClient, moduleName))
    results = await Promise.all(uploadPromises)
    // #endif

    // #ifdef APP-PLUS
    filesToUpload = [screenshots]
    uploadPromises = filesToUpload.map(async (file) => uploadSingleFileApp(file, ossClient, moduleName))
    results = await Promise.all(uploadPromises)
    // #endif

    const validResults = results.filter(Boolean)
    if (validResults.length === 0) {
      throw new Error('所有文件上传失败')
    }
    const formattedResults = validResults.map((file) => ({
      moduleName: moduleName,
      oldFileName: file.oldFileName,
      newFileName: file.newFileName,
      filePath: file.filePath,
      fileType: file.fileType,
      fileSize: file.size,
      ossUrl: file.url,
      ossKey: file.ossKey,
      ossUpload: 1,
    }))
    return formattedResults
  } catch (error) {
    console.error('上传失败:', error)
    uni.showToast({ title: error.message || '上传失败', icon: 'none' })
    return null
  } finally {
    uni.hideLoading()
  }
}

const uploadSingleFileApp = async (file, ossClient, moduleName) => {
  console.log(file, 999888)

  try {
    const fileExt = getFileExtension(file)
    const pathRes = await getOssPathAndName({
      uid: uni.getStorageSync('userId') || 'default',
      moduleName: moduleName,
      fileType: fileExt,
    })

    let ossToken = getCachedOssToken()
    if (!ossToken) {
      ossToken = await fetchAndCacheOssToken()
    }

    const { filePath, newFileName } = pathRes.data
    const client = ossClient || (await getOSSClient())

    let policy = getPolicyBase64(300, pathRes.data.filePath)
    let signature = getSignature(policy, ossToken.accessKeySecret)
    let host = `https://${ossToken.bucket}.${ossToken.region}.aliyuncs.com`
    let accessKeyId = ossToken.accessKeyId
    let accessKeySecret = ossToken.accessKeySecret
    let ossKey = pathRes.data.filePath + pathRes.data.newFileName

    if (!pathRes?.data) {
      throw new Error('获取上传路径失败')
    }

    const uploadRes = await new Promise((resolve, reject) => {
      uni.uploadFile({
        url: host,
        filePath: file.tempFilePath, // App 中必须是 file.path
        name: 'file',
        formData: {
          key: ossKey,
          policy,
          OSSAccessKeyId: accessKeyId,
          accessKeySecret: accessKeySecret,
          signature,
          success_action_status: '200',
          'x-oss-security-token': ossToken.stsToken,
        },
        success: (res) => {
          if (res.statusCode !== 200) {
            throw new Error('上传失败')
          }
          const url = client.signatureUrl(ossKey)

          resolve({
            oldFileName: file.tempFilePath.split('.')[0],
            newFileName: newFileName.split('.')[0],
            filePath,
            fileType: fileExt,
            size: file.size,
            url,
            ossKey,
          })
        },
        fail: reject,
      })
    })

    return uploadRes
  } catch (error) {
    console.error('文件上传失败:', error)
    return null
  }
}

// 上传单个文件
const uploadSingleFile = async (file, ossClient, moduleName) => {
  try {
    const fileExt = getFileExtension(file)
    const pathRes = await getOssPathAndName({
      uid: uni.getStorageSync('userId') || 'default',
      moduleName: moduleName,
      fileType: fileExt,
    })

    if (!pathRes?.data) {
      throw new Error('获取上传路径失败')
    }

    const { filePath, newFileName } = pathRes.data
    const ossKey = `${filePath}${newFileName}`
    const client = ossClient || (await getOSSClient())

    const result = await client.multipartUpload(ossKey, file)
    if (result.res.status !== 200) {
      throw new Error('上传失败')
    }

    const url = client.signatureUrl(ossKey)

    return {
      oldFileName: file.name.split('.')[0],
      newFileName: newFileName.split('.')[0],
      filePath,
      fileType: fileExt,
      size: file.size,
      url,
      ossKey,
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    return null
  }
}

// 获取文件扩展名
export const getFileExtension = (file) => {
  let fileName = ''
  // #ifdef H5
  fileName = file.name || file.tempFilePath
  // #endif

  // #ifdef APP-PLUS
  fileName = file.url || file.tempFilePath
  // #endif
  if (fileName && fileName.includes('.')) {
    return fileName.split('.').pop().toLowerCase()
  }
  return 'file'
}

export const base64ToFile = (base64, fileNamePrefix) => {
  const fileName = generateFilename(fileNamePrefix)
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], fileName, { type: mime })
}

function generateFilename(prefix = 'avatar') {
  const randomStr = Math.random().toString(36).substring(2, 10) // 8位随机字符串
  const timestamp = Date.now() // 时间戳
  return `${prefix}_${randomStr}_${timestamp}.png`
}

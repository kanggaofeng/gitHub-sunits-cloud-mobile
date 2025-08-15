<template>
  <view class="oss-upload-container">
    <!-- 图片列表展示 -->
    <view class="img-list" v-if="imgBaseInfo.type === 'img'">
      <view v-for="(item, index) in fileList" :key="index" class="img-item">
        <!-- 图片类型显示 -->
        <view class="img-preview" @click="handlePreView(item)">
          <image v-if="computedFileShow(item)" class="preview-image" :src="item.url || item.ossUrl" mode="aspectFill"></image>
          <image v-if="!computedFileShow(item)" class="preview-image" src="./video.png" mode="aspectFill"></image>
          <view class="preview-actions">
            <view class="action-btn preview-btn" @click.stop="handlePreView(item)">
              <uni-icons type="eye" size="16" color="#fff"></uni-icons>
            </view>
            <view class="action-btn delete-btn" @click.stop="handleRemove(item, index)">
              <uni-icons type="trash" size="16" color="#fff"></uni-icons>
            </view>
          </view>
        </view>
      </view>
      <!-- 上传按钮 -->
      <view v-if="shouldShowUploadButton" class="img-upload-button" @click="openMenus">
        <view class="img-upload-btn">
          <view class="plus-icon">+</view>
        </view>
      </view>
    </view>
    <!-- 文件列表展示 -->
    <view class="file-list" v-if="imgBaseInfo.type === 'file'">
      <view v-for="(item, index) in fileList" :key="index" class="file-item">
        <!-- 文件类型显示 -->
        <view class="file-preview">
          <view class="file-icon" @click="handlePreView(item)">
            <image v-if="computedFileShow(item)" class="preview-image" :src="item.url || item.ossUrl" mode="aspectFill"></image>
            <DsSvgIcon v-if="!computedFileShow(item)" icon="icon-a-gongdan_hover3x" fontSize="35px" color="#d2d2d2" />
          </view>
          <view class="file-info">
            <text class="file-name">{{ item.name || `${item.oldFileName}.${item.fileType}` }}</text>
            <text class="file-size">
              {{ getFileSizeUnit(item.size || item.fileSize) }}
              <text class="pre-text" @click="handlePreView(item)">预览</text>
            </text>
          </view>
          <view class="file-actions">
            <view v-if="!imgBaseInfo.isDisabled" class="action-btn" @click="handleDownload(item)">
              <uni-icons type="download" size="16" color="#41b883"></uni-icons>
            </view>
            <view v-if="!imgBaseInfo.isDisabled" class="action-btn" @click="handleRemove(item, index)">
              <uni-icons type="trash" size="16" color="#f56c6c"></uni-icons>
            </view>
          </view>
        </view>
      </view>
      <!-- 上传按钮 -->
      <view v-if="shouldShowUploadButton" class="file-upload-button" @click="openMenus">
        <view class="file-upload-btn">
          <uni-icons type="upload" size="18" color="#909399"></uni-icons>
          <text class="upload-text">上传文件</text>
        </view>
      </view>
    </view>

    <!-- 进度条 -->
    <!-- <view v-if="uploading" class="upload-progress">
      <progress :percent="uploadProgress" show-info stroke-width="3" />
    </view> -->

    <!-- 文件预览组件 -->
    <!--<uni-popup ref="txtPreViewRef" is-mask-click type="bottom" border-radius="10px 10px 0 0">-->
    <!--	<view class="txt-pre-view">-->
    <!--		{{txtContent}}-->
    <!--	</view>-->
    <!--</uni-popup>-->

    <!--<uni-popup ref="photoPreViewRef" is-mask-click type="center" border-radius="10px 10px 0 0">-->
    <!--	<view class="photo-pre-view">-->
    <!--  	<image class="preview-image" :src="imgSrc" mode="aspectFill"></image>-->
    <!--	</view>-->
    <!--</uni-popup>-->

    <!--<uni-popup ref="pdfPreViewRef" is-mask-click type="bottom" border-radius="10px 10px 0 0">-->
    <!--	<view class="pdf-pre-view">-->
    <!--		<iframe :src="pdfUrl" width="100%" height="445px"></iframe>-->
    <!--	</view>-->
    <!--</uni-popup>-->

    <!--文件选择 弹出框-->
    <uni-popup ref="menusRef" is-mask-click type="bottom" border-radius="10px 10px 0 0">
      <view class="check-type-menus">
        <view class="menu-item" v-if="isApp" @click="choosePhotoAlbumUpload">
          <view class="menu-icon">
            <DsSvgIcon icon="icon-zhaopian" fontSize="30px" color="#4c4c4c" />
          </view>
          <view class="menu-text">相册</view>
        </view>
        <view class="menu-item" v-if="isApp" @click="chooseCameraUpload">
          <view class="menu-icon">
            <DsSvgIcon icon="icon-paishe" fontSize="30px" color="#4c4c4c" />
          </view>
          <view class="menu-text">拍摄</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue'
import OSS from 'ali-oss'
import { getOssToken, getPolicyBase64, getSignature } from '@/api/sys-file/ossAPI'
import { getOssPathAndName } from '@/api/sys-file/ossAPI'
import { batchSaveSysFile, getFilesByIds } from '@/api/sys-file/sysFileAPI'
import { useFilePreview } from '@/components/OssFileUpload/useFilePreview'
import UniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
import { requestPermissionHandle } from '@/js_sdk/system-permission/permission/permission-handler'
const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: '',
  },
  imgBaseInfo: {
    type: Object,
    default: () => ({
      isMultiple: false,
      maximum: 1,
      isDisabled: false,
      moduleName: 'default',
      autoUpload: true,
      btnShow: true,
      type: 'img',
    }),
  },
})
const platform = uni.getSystemInfoSync().platform
const isApp = typeof plus !== 'undefined'
const emit = defineEmits(['update:modelValue', 'handleSuccess', 'handleRemove'])

// 组件状态
const fileList = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)

// OSS Token 缓存相关
const OSS_TOKEN_CACHE_KEY = 'ossTokenCache'
const OSS_TOKEN_EXPIRES = 3600000 // Token有效期1时(毫秒)

// 计算属性
const shouldShowUploadButton = computed(() => {
  if (props.imgBaseInfo.isDisabled) return false
  if (!props.imgBaseInfo.btnShow) return false
  if (!props.imgBaseInfo.isMultiple && fileList.value.length > 0) return false
  if (props.imgBaseInfo.isMultiple && fileList.value.length >= props.imgBaseInfo.maximum) return false
  return true
})

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
const getOSSClient = async () => {
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

const openMenus = () => {
  if (isApp) {
    proxy.$refs.menusRef.open()
  } else {
    choosePhotoAlbumUpload()
  }
}

// 文件选择处理
const handleSelect = () => {
  if (props.imgBaseInfo.isDisabled) return
  if (props.imgBaseInfo.type === 'img') {
    //#ifdef H5
    uni.chooseImage({
      count: props.imgBaseInfo.isMultiple ? props.imgBaseInfo.maximum : 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles =
          res.tempFiles ||
          res.tempFilePaths.map((path) => ({
            path,
            size: 0,
            name: path.substring(path.lastIndexOf('/') + 1),
          }))
        handleFiles(tempFiles)
      },
    })
    //#endif
    //#ifdef APP-PLUS
    uni.chooseMedia({
      count: props.imgBaseInfo.isMultiple ? props.imgBaseInfo.maximum : 1,
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles =
          res.tempFiles ||
          (res.tempFilePaths &&
            res.tempFilePaths.map((path) => ({
              path,
              size: 0,
              name: path.substring(path.lastIndexOf('/') + 1),
            })))

        handleFiles(tempFiles)
      },
    })
    //#endif
  } else {
    chooseAnyFile((res) => {
      console.log(res, 10989898)
    })
  }
}

// 处理选择的文件
const handleFiles = async (files) => {
  if (!files?.length) return

  if (!props.imgBaseInfo.isMultiple && fileList.value.length > 0) {
    fileList.value = []
  }

  const totalCount = fileList.value.length + files.length
  if (totalCount > props.imgBaseInfo.maximum) {
    uni.showToast({
      title: `最多上传${props.imgBaseInfo.maximum}个文件`,
      icon: 'none',
    })
    return
  }
  let newFiles = ref([])
  try {
    newFiles.value = files.map((file) => {
      return {
        raw: file,
        uploading: true,
        progress: 0,
        url: file.path || file.tempFilePath || URL.createObjectURL(file),
        name: file.name || `file_${Date.now()}`,
        size: file.size || 0,
        type: file.type,
      }
    })
  } catch (err) {
    console.error('文件处理异常', err)
  }

  fileList.value = [...fileList.value, ...newFiles.value]

  if (props.imgBaseInfo.autoUpload) {
    await uploadFiles(newFiles.value)
  } else {
    updateModelValue()
  }
}

// 上传文件到服务器
const uploadFiles = async (filesToUpload) => {
  if (uploading.value) return
  uploading.value = true
  uploadProgress.value = 0
  try {
    uni.showLoading({ title: '上传中...', mask: true })
    let uploadPromises = null
    let results = null
    const ossClient = await getOSSClient()

    // #ifdef H5
    uploadPromises = filesToUpload.map((file) => uploadSingleFile(file, ossClient))
    results = await Promise.all(uploadPromises)
    // #endif

    // #ifdef APP-PLUS
    uploadPromises = filesToUpload.map(async (file) => uploadSingleFileApp(file, ossClient))
    results = await Promise.all(uploadPromises)
    // #endif
    const validResults = results.filter(Boolean)
    if (validResults.length === 0) {
      throw new Error('所有文件上传失败')
    }

    const saveRes = await batchSaveSysFile(
      validResults.map((file) => ({
        moduleName: props.imgBaseInfo.moduleName,
        oldFileName: file.oldFileName,
        newFileName: file.newFileName,
        filePath: file.filePath,
        fileType: file.type || file.fileType,
        fileSize: file.size,
        ossUrl: file.url,
        ossKey: file.ossKey,
        ossUpload: 1,
      })),
    )

    if (saveRes.code !== 200 || !saveRes.data) {
      throw new Error('保存文件信息失败')
    }

    updateFileListWithSavedData(validResults, saveRes.data)
    updateModelValue()
    emit('handleSuccess', fileList.value)
    uni.showToast({ title: '上传成功', icon: 'success' })
  } catch (error) {
    console.error('上传失败:', error)
    uni.showToast({ title: error.message || '上传失败', icon: 'none' })
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    uni.hideLoading()
  }
}

const uploadSingleFileApp = async (file, ossClient) => {
  try {
    const fileExt = file.type || getFileExtension(file)
    const pathRes = await getOssPathAndName({
      uid: uni.getStorageSync('userId') || 'default',
      moduleName: props.imgBaseInfo.moduleName,
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
        filePath: file.raw.path || file.raw.tempFilePath, // App 中必须是 file.path
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
            oldFileName: file.name.split('.')[0],
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
const uploadSingleFile = async (file, ossClient) => {
  try {
    const fileExt = getFileExtension(file)
    const pathRes = await getOssPathAndName({
      uid: uni.getStorageSync('userId') || 'default',
      moduleName: props.imgBaseInfo.moduleName,
      fileType: fileExt,
    })

    if (!pathRes?.data) {
      throw new Error('获取上传路径失败')
    }

    const { filePath, newFileName } = pathRes.data
    const ossKey = `${filePath}${newFileName}`
    const client = ossClient || (await getOSSClient())

    const result = await client.multipartUpload(ossKey, file.raw)
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
const getFileExtension = (file) => {
  let fileName = ''
  // #ifdef H5
  fileName = file.name
  // #endif

  // #ifdef APP-PLUS
  fileName = file.url
  // #endif
  if (fileName && fileName.includes('.')) {
    return fileName.split('.').pop().toLowerCase()
  }
  return 'file'
}

// 更新文件列表
const updateFileListWithSavedData = (uploadedFiles, savedFiles) => {
  savedFiles.forEach((savedFile, index) => {
    const fileIndex = fileList.value.findIndex((f) => f.uploading && f.name.includes(uploadedFiles[index].oldFileName))

    if (fileIndex !== -1) {
      fileList.value[fileIndex] = {
        ...fileList.value[fileIndex],
        id: savedFile.id,
        url: uploadedFiles[index].url,
        uploading: false,
        progress: 100,
      }
    }
  })
}

// 更新v-model值
const updateModelValue = () => {
  const fileIds = fileList.value
    .filter((file) => file.id)
    .map((file) => file.id)
    .join(',')

  emit('update:modelValue', fileIds)
}

// 删除文件
const handleRemove = (file, index) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除此文件吗？',
    success: (res) => {
      if (res.confirm) {
        fileList.value.splice(index, 1)
        updateModelValue()
        emit('handleRemove', file)
      }
    },
  })
}

// 格式化文件大小
const getFileSizeUnit = (size) => {
  if (!size) return '0B'
  let sizeInBytes = Number(size)
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (sizeInBytes >= 1024 && i < units.length - 1) {
    sizeInBytes /= 1024
    i++
  }
  return `${sizeInBytes.toFixed(2)}${units[i]}`
}

// 加载文件列表 - 移到 watch 之前解决引用问题
const loadFilesByIds = async (ids) => {
  if (!ids) return
  try {
    const idArray = Array.isArray(ids) ? ids : ids.split(',').filter(Boolean)
    if (idArray.length === 0) return

    const res = await getFilesByIds({ fileIds: idArray.join(',') })

    if (res.code === 200 && res.data?.length > 0) {
      fileList.value = res.data.map((item) => ({
        ...item,
        name: `${item.oldFileName}.${item.fileType}`,
        url: item.url,
      }))
    }
  } catch (error) {
    console.error('加载文件失败:', error)
  }
}

const computedFileShow = (file) => {
  let fileName = file.name
  let fileType = ''
  // #ifdef H5
  fileType = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length).toLowerCase()
  // #endif

  // #ifdef APP-PLUS
  fileType = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length).toLowerCase()
  // #endif
  if (fileType === 'pdf') {
    return false
  } else if (fileType === 'img' || fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg') {
    return true
  } else if (fileType === 'txt') {
    return false
  } else if (fileType === 'mp4') {
    return false
  } else {
    return false
  }
}

const choosePhotoAlbumUpload = async () => {
  const hasPermission = await requestPermissionHandle('PHOTO')
  if (!hasPermission) {
    return
  }
  try {
    const chooseRes = await choosePhotoAlbum(props.imgBaseInfo.isMultiple, props.imgBaseInfo.maximum, props.imgBaseInfo.type)
    proxy.$refs.menusRef.close()
    handleFiles(chooseRes)
  } catch (error) {
    // Handle user cancellation gracefully
    if (error.errMsg === 'user cancel') {
      console.log('User cancelled media selection')
      return
    }
    // Handle other errors
    console.error('Media selection error:', error)
    uni.showToast({ title: '选择文件失败', icon: 'none' })
  }
}

const chooseCameraUpload = async () => {
  const hasPermission = await requestPermissionHandle('CAMERA')
  if (!hasPermission) {
    return
  }
  try {
    const chooseRes = await chooseCamera(props.imgBaseInfo.isMultiple, props.imgBaseInfo.maximum)
    proxy.$refs.menusRef.close()
    handleFiles(chooseRes)
  } catch (error) {
    // Handle user cancellation gracefully
    if (error.errMsg === 'user cancel') {
      console.log('User cancelled camera selection')
      return
    }
    // Handle other errors
    console.error('Camera selection error:', error)
    uni.showToast({ title: '选择文件失败', icon: 'none' })
  }
}

// 工具方法判断 modelValue 是否有效
function hasModelValue(value) {
  return (typeof value === 'string' && value.trim() !== '') || (Array.isArray(value) && value.length > 0)
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (hasModelValue(newVal)) {
      loadFilesByIds(newVal)
    } else {
      // 当 modelValue 为空时，清空文件列表
      fileList.value = []
    }
  },
  { immediate: true }, // 初始已经在 onMounted 中处理，这里不需要立即执行
)

// 使用预览相关的组合式函数
const { videoSrc, handlePreView, chooseAnyFile, choosePhotoAlbum, chooseCamera, handleDownload } = useFilePreview(proxy, emit, fileList)

// 暴露方法
defineExpose({
  triggerFileSelect: handleSelect,
  manualUpload: uploadFiles,
  fileList,
  getFileData: () => fileList.value,
})
</script>

<style lang="scss" scoped>
@import './OssFilesMultipleUpload.scss';

:deep(.file-icon) {
  .preview-image {
    width: 35px;
    height: 35px;
    border-radius: 5px;
  }
}

:deep(.file-actions) {
  display: flex;
  justify-content: space-between;
}

:deep(.pre-text) {
  margin-left: 10px;
  color: #409eff;
  cursor: pointer;
}
</style>

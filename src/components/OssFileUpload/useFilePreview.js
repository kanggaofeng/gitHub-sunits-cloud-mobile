export function useFilePreview(proxy, emits, fileList) {
  const previewUrl = 'https://keking.sunits.com/'
  // 预览相关状态
  const dialogImageUrl = ref('')
  const dialogVisible = ref(false)

  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'jfif']
  const fileTypes = ['xlsx', 'xls', 'doc', 'docx', 'pdf', 'txt', 'html']
  const videoTypes = ['mp4', 'avi', 'mov', 'mkv']

  // 预览相关方法
  const handlePictureCardPreview = (file) => {
    dialogImageUrl.value = file.url
    dialogVisible.value = true
  }

  const izImage = (fileType) => {
    return imageTypes.includes(fileType)
  }
  const izFille = (fileType) => {
    return fileTypes.includes(fileType)
  }
  const izVideo = (fileType) => {
    return videoTypes.includes(fileType)
  }

  const handlePreView = (file) => {
    let fileName = file.name
    let fileType = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length).toLowerCase()
    if (izImage(fileType)) {
      uni.previewImage({
        urls: [file.url],
        success: () => {
          console.log('预览成功')
        },
        fail: (err) => {
          console.log('预览失败', err)
        },
      })
    } else if (izFille(fileType)) {
      uni.showToast({
        title: '当前格式需要下载到本地查看',
      })
    } else if (izVideo(fileType)) {
      const encodedUrl = encodeURIComponent(btoa(file.url)) // Base64 + encodeURIComponent
      uni.navigateTo({
        url: `/pages/PreviewCommon/videoview/index?url=${encodedUrl}`,
      })
    }
  }

  async function fetchTxtFile(url) {
    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const decoder = new TextDecoder('utf-8')
      const decodedText = decoder.decode(arrayBuffer)
      txtContent.value = decodedText
    } catch (error) {
      console.error('无法加载文件', error)
    }
  }

  // 创建文件夹，path值为："/storage/emulated/0/自定义文件夹名称"
  const createDir = async (path, callback) => {
    // 申请本地存储读写权限
    plus.android.requestPermissions(
      ['android.permission.WRITE_EXTERNAL_STORAGE', 'android.permission.READ_EXTERNAL_STORAGE', 'android.permission.INTERNET', 'android.permission.ACCESS_WIFI_STATE'],
      (success) => {
        const File = plus.android.importClass('java.io.File')
        let file = new File(path)
        // 文件夹不存在即创建
        if (!file.exists()) {
          file.mkdirs()
          callback && callback()
          return false
        }
        callback && callback()
        return false
      },
      (error) => {
        uni.$u.toast('无法获取权限，文件下载将出错')
      },
    )
  }

  const handleDownload = async (file) => {
    if (!file.url) {
      proxy.$modal.msgWarning('当前文件不可下载')
      return
    }

    // #ifdef H5
    try {
      const response = await fetch(file.url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = blobUrl
      a.download = file.name || '下载文件'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      proxy.$modal.msgError('下载失败')
    }
    // #endif

    // #ifdef APP-PLUS
    downloadByPlus(file.url, file.name || '下载文件.png')
    // #endif
  }

  const downloadByPlus = (url, filename = '下载文件') => {
    const platform = uni.getSystemInfoSync().platform

    // 获取文件扩展名
    const fileExt = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase()
    const isImage = ['jpg', 'jpeg', 'png'].includes(fileExt)
    const isVideo = ['mp4'].includes(fileExt)
    const isMedia = isImage || isVideo

    // 安卓保存路径（比如 /storage/emulated/0/Android/data/.../download/）
    const androidSavePath = `_downloads/YGWF/${filename}`

    // iOS 保存路径
    const iosSavePath = `_downloads/${filename}`

    const savePath = platform === 'android' ? androidSavePath : iosSavePath

    const downloadTask = plus.downloader.createDownload(url, { filename: savePath }, (download, status) => {
      if (status === 200) {
        const filePath = download.filename

        if (isMedia) {
          // 保存到系统相册
          plus.gallery.save(
            filePath,
            () => {
              uni.showToast({
                title: '保存到相册成功',
                icon: 'success',
              })
            },
            (err) => {
              console.log(err, 98989898)
              uni.showToast({
                title: '保存到相册失败',
                icon: 'none',
              })
            },
          )
          return
        }

        // 非图片/视频走普通保存逻辑
        uni.showModal({
          title: '提示',
          content: '如需保存到本地，需要打开文件点击储存',
          confirmText: '打开文件',
          success: (res) => {
            if (res.confirm) {
              uni.openDocument({
                filePath: filePath,
                success: () => {
                  console.log('文件已打开，用户可手动保存')
                },
                fail: () => {
                  proxy.$modal.msgError('打开文件失败')
                },
              })
            }
          },
        })
      } else {
        proxy.$modal.msgError('下载失败')
      }
    })

    downloadTask.start()
  }

  const handleRemove = (file) => {
    const newFileList = file?.id ? fileList.value.filter((item) => item.id !== file.id) : fileList.value.filter((item) => item.uid !== file.uid)
    fileList.value = newFileList
    const uploadedIds = newFileList.map((item) => item.id).join(',')
    emits('update:modelValue', uploadedIds)
    emits('handleRemove', newFileList)
  }

  const getFileSizeUnit = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  function chooseAnyFile(callback) {
    const platform = uni.getSystemInfoSync().platform

    // #ifdef APP-PLUS
    if (platform === 'android') {
      // Android 原生文件选择 + 权限
      plus.android.requestPermissions(['android.permission.READ_EXTERNAL_STORAGE', 'android.permission.WRITE_EXTERNAL_STORAGE'], function (res) {
        if (!res.granted || res.granted.length === 0) {
          uni.showToast({ title: '请授权访问存储权限', icon: 'none' })
          return
        }

        const main = plus.android.runtimeMainActivity()
        const Intent = plus.android.importClass('android.content.Intent')
        const intent = new Intent(Intent.ACTION_GET_CONTENT)
        intent.setType('*/*')
        intent.addCategory(Intent.CATEGORY_OPENABLE)
        main.startActivityForResult(intent, 1001)

        main.onActivityResult = function (requestCode, resultCode, data) {
          if (requestCode === 1001 && resultCode === -1) {
            const uri = data.getData()
            const filePath = uri?.toString()
            callback &&
              callback({
                uri,
                filePath,
                platform: 'android',
              })
          }
        }
      })
    } else if (platform === 'ios') {
      // iOS：使用 plus.document.pickDocument 模拟文件选择
      plus.nativeUI.actionSheet(
        {
          title: '选择文件来源',
          cancel: '取消',
          buttons: [{ title: '选择图片' }, { title: '选择相机' }],
        },
        function (e) {
          if (e.index === 1) {
            plus.io.chooseFile({
              multiple: false,
              extensions: ['*'], // 可根据实际限制扩展名
              success: function (res) {
                console.log('选中文件路径:', res.files[0].fullPath)
                uni.showToast({ title: '文件选择成功', icon: 'success' })
              },
              fail: function (err) {
                console.error('文件选择失败', err)
                uni.showToast({ title: '选择失败', icon: 'none' })
              },
            })
          }
        },
      )
    }
    // #endif

    // #ifndef APP-PLUS
    // H5 / 小程序备用逻辑
    uni.chooseFile({
      count: 1,
      success: (res) => {
        const file = res.tempFiles[0]
        callback &&
          callback({
            name: file.name,
            path: file.path || file.tempFilePath,
            size: file.size,
            platform,
          })
      },
    })
    // #endif
  }

  const choosePhotoAlbum = (isMultiple, maximum, fileType) => {
    return new Promise((resolve, reject) => {
      // #ifdef H5
      uni.chooseFile({
        count: isMultiple ? maximum : 1,
        success: (res) => {
          if (fileType === 'img') {
            const validFiles = res.tempFiles.filter((file) => {
              return file.type.startsWith('image/') || file.type.startsWith('video/')
            })

            if (validFiles.length === 0) {
              uni.showToast({ title: '请选择图片或视频', icon: 'none' })
              return
            }
          }

          const tempFiles =
            res.tempFiles ||
            res.tempFilePaths.map((path) => ({
              path,
              size: 0,
              name: path.substring(path.lastIndexOf('/') + 1),
            }))
          resolve(tempFiles)
        },
        fail: (err) => reject(err),
      })
      // #endif

      // #ifndef H5
      uni.chooseMedia({
        count: isMultiple ? maximum : 1,
        mediaType: ['image', 'video'],
        sourceType: ['album'],
        maxDuration: 60,
        camera: 'back',
        success: (res) => {
          const normalizedFiles = res.tempFiles.map(normalizeMediaFile)
          console.log(normalizedFiles, 99898989)
          resolve(normalizedFiles)
        },
        fail: (err) => reject(err),
      })
      // #endif
    })
  }
  const chooseCamera = (isMultiple, maximum) => {
    return new Promise((resolve, reject) => {
      // #ifdef H5
      uni.chooseFile({
        count: isMultiple ? maximum : 1,
        success: (res) => {
          const tempFiles =
            res.tempFiles ||
            res.tempFilePaths.map((path) => ({
              path,
              size: 0,
              name: path.substring(path.lastIndexOf('/') + 1),
            }))
          resolve(tempFiles)
        },
        fail: (err) => reject(err),
      })
      // #endif

      // #ifndef H5
      uni.chooseMedia({
        count: isMultiple ? maximum : 1,
        mediaType: ['image', 'video'],
        sourceType: ['camera'],
        maxDuration: 60,
        camera: 'back',
        success: (res) => {
          const tempFiles = (res.tempFiles || []).map((file) => {
            const filePath = file.tempFilePath || file.path || ''
            const extension = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase()

            return {
              ...file,
              path: filePath,
              name: filePath.substring(filePath.lastIndexOf('/') + 1),
              type: extension, // 添加后缀类型
            }
          })
          console.log(tempFiles, 299999)
          resolve(tempFiles)
        },
        fail: (err) => reject(err),
      })
      // #endif
    })
  }
  const normalizeMediaFile = (file) => {
    const isVideo = file.fileType === 'video'

    const filePath = file.tempFilePath || file.path || ''

    let extension = ''
    if (filePath.startsWith('content://')) {
      // Android 视频可能是 content://，扩展名不可直接取，做默认值
      extension = isVideo ? 'mp4' : 'jpg'
    } else {
      const dotIndex = filePath.lastIndexOf('.')
      extension = dotIndex !== -1 ? filePath.substring(dotIndex + 1).toLowerCase() : ''
    }
    let name = filePath.substring(filePath.lastIndexOf('/') + 1)

    if (!name.includes('.')) {
      name += `.${extension}`
    }

    return {
      ...file,
      path: filePath,
      name,
      type: extension,
      thumb: isVideo ? file.thumbTempFilePath : '', // 视频缩略图
    }
  }

  return {
    getFileSizeUnit,
    handleRemove,
    handleDownload,
    handlePictureCardPreview,
    handlePreView,
    chooseAnyFile,
    choosePhotoAlbum,
    chooseCamera,
  }
}

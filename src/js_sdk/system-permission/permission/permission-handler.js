import permissionBase from './aQungXian.js'

// Android权限状态常量
const AndroidPermissionStatus = {
  GRANTED: 1, // 已获得授权
  DENIED: 0, // 未获得授权
  PERMANENTLY_DENIED: -1, // 拒绝，且不再询问
}

// 权限类型映射
const permissionMap = {
  PHOTO: {
    android: 'android.permission.READ_EXTERNAL_STORAGE',
    ios: 'photoLibrary',
    name: '相册',
  },
  CAMERA: {
    android: 'android.permission.CAMERA',
    ios: 'camera',
    name: '相机',
  },
  LOCATION: {
    android: 'android.permission.ACCESS_FINE_LOCATION',
    ios: 'location',
    name: '定位',
  },
  RECORD: {
    android: 'android.permission.RECORD_AUDIO',
    ios: 'record',
    name: '录音',
  },
  CONTACTS: {
    android: 'android.permission.READ_CONTACTS',
    ios: 'contact',
    name: '通讯录',
  },
  CALENDAR: {
    android: 'android.permission.READ_CALENDAR',
    ios: 'calendar',
    name: '日历',
  },
  PUSH: {
    android: '', // Android 推送不需要运行时权限
    ios: 'push',
    name: '推送',
  },
}

// 检查并请求权限
const requestPermission = async (permissionType) => {
  // 获取权限配置
  const permission = permissionMap[permissionType]
  if (!permission) {
    throw new Error('不支持的权限类型')
  }

  // #ifdef APP-PLUS
  const isIOS = plus.os.name === 'iOS'

  try {
    if (isIOS) {
      const result = permissionBase.judgeIosPermission(permission.ios)
      if (!result) {
        uni.showModal({
          title: '提示',
          content: `需要${permission.name}权限，是否前往设置？`,
          confirmText: '前往设置',
          success: (res) => {
            if (res.confirm) {
              permissionBase.gotoAppPermissionSetting()
            }
          },
        })
      }
      return result
    } else {
      console.log('📢 [permission-handler.js:77]', 44444)
      const result = await permissionBase.requestAndroidPermission(permission.android)
      if (result !== AndroidPermissionStatus.GRANTED) {
        uni.showModal({
          title: '提示',
          content: `需要${permission.name}权限，是否前往设置？`,
          confirmText: '前往设置',
          success: (res) => {
            if (res.confirm) {
              permissionBase.gotoAppPermissionSetting()
            }
          },
        })
      }
      return result === AndroidPermissionStatus.GRANTED
    }
  } catch (error) {
    console.error('权限请求失败:', error)
    return false
  }
  // #endif

  // #ifndef APP-PLUS
  console.warn('当前环境不支持权限请求')
  return false
  // #endif
}

// 统一的权限处理函数
const requestPermissionHandle = async (type) => {
  // H5环境下相册、相机和推送权限默认为true
  // #ifdef H5
  if (type === 'PHOTO' || type === 'CAMERA' || type === 'PUSH') {
    return true
  }
  // #endif

  // #ifdef APP-PLUS
  if (plus.os.name === 'iOS') {
    // iOS设备需要请求权限
    const result = await requestPermission(type)
    return result
  } else {
    // 非iOS设备直接通过
    return true
  }
  // #endif

  return false
}

// 获取所有支持的权限列表
const getPermissionList = () => {
  return Object.entries(permissionMap).map(([key, value]) => ({
    key,
    name: value.name,
  }))
}

// 导出所有需要的函数
export { requestPermissionHandle, getPermissionList }

import request from '@/utils/request'

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword,
  }
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    params: data,
  })
}

// 查询用户个人信息
export function getUserProfile() {
  return request({
    url: '/system/user/profile',
    method: 'get',
  })
}

// 头像上传
export function saveUploadAvatare(data) {
  return request({
    url: '/system/user/uploadAvatar',
    method: 'post',
    data: data,
  })
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return request({
    url: '/system/user/profile',
    method: 'put',
    data: data,
  })
}

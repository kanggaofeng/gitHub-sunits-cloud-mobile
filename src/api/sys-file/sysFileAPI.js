import request from '@/utils/request'
// 单个图片,单个文件
export function saveSysFile(data) {
  return request({
    url: '/file/sysFile/add',
    method: 'post',
    data: data,
  })
}
// 多个图片,多个文件
export function batchSaveSysFile(data) {
  return request({
    url: '/file/sysFile/batchAdd',
    method: 'post',
    data: data,
  })
}

export function getFilesByIds(data) {
  return request({
    url: '/file/sysFile/getInfoByIds',
    method: 'get',
    params: data,
  })
}

// 获取单个文件信息通过ID
export function getFileById(fileId) {
  return request({
    url: '/file/sysFile/getInfoById',
    method: 'get',
    params: { fileId },
  })
}
export function fileDownload(id) {
  return request({
    url: '/file/sysFile/media?id=' + id,
    method: 'get',
    responseType: 'blob', // 关键点：告诉后端返回的是文件流
  })
}

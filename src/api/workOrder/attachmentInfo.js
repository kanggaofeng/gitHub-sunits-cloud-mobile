import request from '@/utils/request'

// 附件信息
export function getIncFileInfo(query) {
  return request({
    url: '/workorder/incident/getIncFileInfo',
    method: 'get',
    params: query,
  })
}

export function saveIncFileInfo(data) {
  return request({
    url: '/workorder/incident/saveIncFileInfo',
    method: 'post',
    data: data,
  })
}

// 更新
export function updateIncFileInfo(data) {
  return request({
    url: '/workorder/incident/updateIncFileInfo',
    method: 'put',
    data: data,
  })
}

//删除附件
export function removeIncFile(incFileRelationId) {
  return request({
    url: `/workorder/incident/removeIncFile/${incFileRelationId}`,
    method: 'delete',
  })
}

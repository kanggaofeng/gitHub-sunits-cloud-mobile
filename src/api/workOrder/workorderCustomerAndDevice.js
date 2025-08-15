import request from '@/utils/request.js'

export function getWorkorderCustomerAndDevice(workorderId) {
  return request({
    url: '/workorder/incident/getIncCusEquInfo/' + workorderId,
    method: 'get',
  })
}

export function listProInfoConfigByProId(query) {
  return request({
    url: '/system/pro/info/listProInfoConfigByProId',
    method: 'get',
    params: query,
  })
}

export function editWorkorderCustomerAndDevice(data) {
  return request({
    url: '/workorder/incident/updateIncCusInfo',
    method: 'put',
    data: data,
  })
}

// 工单详情[新增设备信息]
// POST / workorder / relation / saveIncEquInfo
export function saveIncEquInfo(data) {
  return request({
    url: '/workorder/relation/saveIncEquInfo',
    method: 'post',
    data: data,
  })
}
// 工单详情[更新设备信息]
// PUT / workorder / relation / updateIncEquInfo
export function updateIncEquInfo(data) {
  return request({
    url: '/workorder/relation/updateIncEquInfo',
    method: 'put',
    data: data,
  })
}
// DELETE
// /workorder/relation/removeIncEquInfo/{id}
export function removeIncEquInfo(id) {
  return request({
    url: '/workorder/relation/removeIncEquInfo/' + id,
    method: 'delete',
  })
}

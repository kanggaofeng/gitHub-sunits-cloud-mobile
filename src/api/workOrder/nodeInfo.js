import request from '@/utils/request'

// 查询自定义表单
// activityId 1873909224245469186
export function getCustomForm(incidentId, activityId) {
  return request({
    url: '/workorder/incActivity/configs/' + incidentId + '/' + activityId,
    method: 'get',
  })
}
export function activityField(activityId) {
  return request({
    url: '/workorder/activity/field/' + activityId,
    method: 'get',
  })
}

export function tempSave(data) {
  return request({
    url: '/workorder/incActivity/values/tempSave',
    method: 'post',
    data: data,
  })
}

export function appoint(data) {
  return request({
    url: '/workorder/appoint',
    method: 'post',
    data: data,
  })
}

export function updateIncServiceInfo(data) {
  return request({
    url: '/workorder/incident/updateIncServiceInfo',
    method: 'post',
    data: data,
  })
}

// 下一步
export function nextStepSave(data) {
  return request({
    url: '/workorder/incident/nextStepSave',
    method: 'post',
    data: data,
  })
}

// 下一步 a
export function nextStepForward(data) {
  return request({
    url: '/workorder/incident/nextStepForward',
    method: 'post',
    data: data,
  })
}

// 获取预约记录列表
export function getAppointList(incidentId) {
  return request({
    url: '/workorder/appoint/listByIncId/' + incidentId,
    method: 'get',
  })
}

// 改约提交
export function reAppoint(data) {
  return request({
    url: '/workorder/appoint/reAppoint',
    method: 'post',
    data: data,
  })
}

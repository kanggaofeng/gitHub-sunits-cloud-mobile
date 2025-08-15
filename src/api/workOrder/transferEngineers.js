import request from '@/utils/request'

// 查询自定义表单
export function stationList(data) {
  return request({
    url: '/system/station/list',
    method: 'get',
    params: data,
  })
}

export function listStationMemberByStationId(data) {
  return request({
    url: '/system/user/listStationMemberByStationId',
    method: 'get',
    params: data,
  })
}

// ?incidentId=150&currentActivityId=&receivePerson
export function reassignIncTask(data) {
  return request({
    url: '/workorder/incident/reassignIncTask',
    method: 'post',
    data: data,
  })
}
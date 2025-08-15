import request from '@/utils/request'

// 获取工单列表数据
export function getWorkOrderList(params) {
  return request({
    url: '/workorder/app/listHomePageIncidentData',
    method: 'get',
    params: {
      ...params,
    },
  })
}

// 获取工单状态数量
// 默认 create_time开单时间 go_time 上门时间
// 默认 desc降序 asc升序

export function getWorkOrderStatusCount(params) {
  return request({
    url: '/workorder/app/countlistHomePageIncidentData',
    method: 'get',
    params: {
      ...params,
    },
  })
}

// 标记重要工单
export function markImportantWorkOrder(params) {
  return request({
    url: '/workorder/app/markImportant',
    method: 'post',
    data: params,
  })
}

// 获取工单信息
export function getInfo(params) {
  return request({
    url: '/workorder/app/getInfo',
    method: 'get',
    params: {
      ...params,
    },
  })
}
// 重点关注
// "incidentId": 1,
// "checked": 1
export function attention(params) {
  return request({
    url: '/workorder/attention',
    method: 'post',
    data: params,
  })
}
// 已知晓API
// /workorder/app/confirmCancelled/{incId}
export function confirmCancelled(incId) {
  return request({
    url: `/workorder/app/confirmCancelled/${incId}`,
    method: 'put',
  })
}

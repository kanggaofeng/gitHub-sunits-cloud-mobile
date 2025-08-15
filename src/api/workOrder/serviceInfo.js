import request from '@/utils/request.js'

// 获取工单服务信息
export function getServiceInfo(incId) {
  return request({
    url: '/workorder/incident/getIncServiceInfo/'+incId,
    method: 'get',
  })
}
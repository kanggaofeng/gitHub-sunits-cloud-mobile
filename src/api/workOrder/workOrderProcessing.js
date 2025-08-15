import request from '@/utils/request'

// 查询工单状态概览 基本信息 工作相关人员信息
export function workOrderBaseInfo(id = '1864558318944768001') {
  return request({
    url: '/workorder/incident/' + id,
    method: 'get',
  })
}

// 查询自定义表单
export function activityField(activityId = '1863502387600166914') {
  return request({
    url: '/workorder/activity/field/' + activityId,
    method: 'get',
  })
}
// 查询sla 考核进度信息
export function getSlaAssessmentProgress(query) {
  return request({
    url: '/workorder/kpi/listKpiByIncId',
    method: 'get',
    params: query,
  })
}

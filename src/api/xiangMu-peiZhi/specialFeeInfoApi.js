import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/ruoyi'

// 获取项目通用配置API
export function getProjecrCommonConfig(projectId) {
  return request({
    url: '/workorder/projectCommon/' + projectId,
    method: 'get',
  })
}

// 修改项目通用配置API
export function updateProjectCommon(data) {
  return request({
    url: '/workorder/projectCommon',
    method: 'put',
    data: data,
  })
}

// 特殊费用申请API
export function specialFeeApply(data) {
  return request({
    url: '/workorder/cost',
    method: 'post',
    data: data,
  })
}

// 获取申请特费列表API
export function getSpecialFeeList(params) {
  return request({
    url: '/workorder/cost/list',
    method: 'get',
    params: params,
  })
}

// 获取审批详情页API
export function getApprovalInfo(specialFeeId) {
  return request({
    url: '/workorder/cost/' + specialFeeId,
    method: 'get',
  })
}

// 特殊费用审批API
export function approvalCost(data) {
  return request({
    url: '/workorder/cost',
    method: 'put',
    data: data,
  })
}

// 新增特费消息配置API
export function addSpecialFeeMsgConfig(data) {
  return request({
    url: '/workorder/msgCost',
    method: 'post',
    data: data,
  })
}

// 获取特费消息配置列表API
export function getSpecialFeeMsgConfigList(params) {
  return request({
    url: '/workorder/msgCost/list',
    method: 'get',
    params: params,
  })
}

// 修改特费消息配置API
export function updateSpecialFeeMsgConfigList(data) {
  return request({
    url: '/workorder/msgCost',
    method: 'put',
    data: data,
  })
}

// 特费查询列表API
export function getSpecialFeeInfoList(params) {
  return request({
    url: '/workorder/cost/querySpecialCostList',
    method: 'get',
    params: params,
  })
}

// 删除消息配置API
export function delMsgConfigIds(msgConfigIds) {
  return request({
    url: '/workorder/msgCost/' + msgConfigIds,
    method: 'delete',
  })
}

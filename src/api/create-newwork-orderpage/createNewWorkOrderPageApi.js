import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/ruoyi'

// 开单提交接API
export function createIncident(data) {
  return request({
    url: '/workorder/openIncidentApi/createIncident',
    method: 'post',
    data: data,
  })
}
// 查询用户列表

export function listInProject(query) {
  return request({
    url: '/system/cus/listInProject',
    method: 'get',
    params: query,
  })
}

export function listProInfoConfigByProId(query) {
  return request({
    url: '/system/pro/info/listProInfoConfigByProId',
    method: 'get',
    params: query,
  })
}

// 新增地址
export function addAdress(data) {
  return request({
    url: '/system/cus/address',
    method: 'post',
    data: data,
  })
}
// 修改地址
export function updateAdress(data) {
  return request({
    url: '/system/cus/address',
    method: 'put',
    data: data,
  })
}

// 删除地址
export function delAdress(roleId) {
  return request({
    url: '/system/cus/address/' + roleId,
    method: 'delete',
  })
}
// 服务信息

// 服务流程
export function getServiceInfoList(query) {
  return request({
    url: '/workorder/process/list',
    method: 'get',
    params: query,
  })
}

// 获取SLA信息
export function getSLAInfo(query) {
  return request({
    url: '/workorder/sla/listSLAInfo',
    method: 'get',
    params: query,
  })
}

// 开单用，按项目、设备模式和SN查询设备信息
// /system/equ/listInProject
// 参数：projectId，search输入的SN，equMode 设备模式0=单台 1=批量 2保修库

export function listInSheBei(query) {
  return request({
    url: '/system/equ/listInProject',
    method: 'get',
    params: query,
  })
}
// 设备添加
export function addEqu(data) {
  return request({
    url: '/system/equ',
    method: 'post',
    data: data,
  })
}
// 设备编辑
export function updateEqu(data) {
  return request({
    url: '/system/equ',
    method: 'put',
    data: data,
  })
}
// 批量设备添加
export function addEquBatch(data) {
  return request({
    url: '/system/equ/batch',
    method: 'post',
    data: data,
  })
}
// [总部直管-全部范围]获取所有可用服务站列表API
// 状态：0=可用 1=停用
// 参数：pageNum，pageSize，status
export function getStationList(query) {
  return request({
    url: '/system/station/list',
    method: 'get',
    params: query,
  })
}
// [总部直管-指定范围]获取服务站列表
// 参数：projectId，processId，province，city，county
export function hqDirectControSpecifyTheScope(query) {
  return request({
    url: '/workorder/openIncidentApi/hqDirectControSpecifyTheScope',
    method: 'get',
    params: query,
  })
}
// [区域协调]获取所有区域协调负责人列表API
// 参数：projectId，cityId
export function regionalDirectControSpecify(query) {
  return request({
    url: '/system/coordinateRegion/regionalDirectControSpecify',
    method: 'get',
    params: query,
  })
}
// 获取服务站工程师AP
// /system/user/listStationMemberByStationId?stationId=150
export function listStationMemberByStationId(query) {
  return request({
    url: '/system/user/listStationMemberByStationId',
    method: 'get',
    params: query,
  })
}

// [根据工程师反选服务站]获取服务站工程师API
export function listStationUser(query) {
  return request({
    url: '/system/user/listStationUser',
    method: 'get',
    params: query,
  })
}

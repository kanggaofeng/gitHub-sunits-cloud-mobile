import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/ruoyi'

// 查询项目列表
export function getProjectList(query) {
  return request({
    url: '/system/project/list',
    method: 'get',
    params: query,
  })
}

// 查询项目详细
export function getProjectDetail(projectId) {
  return request({
    url: '/system/project/' + parseStrEmpty(projectId),
    method: 'get',
  })
}

export function updateProject(data) {
  return request({
    url: '/system/project',
    method: 'put',
    data: data,
  })
}

export function addProject(data) {
  return request({
    url: '/system/project',
    method: 'post',
    data: data,
  })
}

// 删除项目
export function deleteProject(projectId) {
  return request({
    url: '/system/project/' + projectId,
    method: 'delete',
  })
}

// 查询企业列表
export function getCompanyList(query) {
  return request({
    url: '/system/company/list',
    method: 'get',
    params: query,
  })
}

// 服务基本信息配置
export function addProjectBaseConfig(data) {
  return request({
    url: '/system/pro/info/proInfoConfig',
    method: 'post',
    data: data,
  })
}

// 修改项目信息
export function updateProjectInfo(data) {
  return request({
    url: '/system/pro/info',
    method: 'put',
    data: data,
  })
}

export function addProjectInfo(data) {
  return request({
    url: '/system/pro/info',
    method: 'post',
    data: data,
  })
}

export function getProjectConfigAndOption(projectId, type) {
  return request({
    url: '/system/pro/info/proInfoConfigByPro' + '?projectId=' + projectId + '&type=' + type,
    method: 'get',
  })
}

// 刷新项目配置字段数据到redis
export function refreshProjectConfigCache() {
  return request({
    url: '/system/cache/cacheProInfoConfigList',
    method: 'get',
  })
}

// 获取当前用户项目列表
export function getCurrentUserProjectList() {
  return request({
    url: '/system/project/operationHome/projectList',
    method: 'get',
  })
}

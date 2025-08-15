import request from '@/utils/request.js'

// 获取工单列表信息
export function getAllList(params) {
    return request({
        url: '/workorder/incident/list',
        method: 'get',
        params: params
    })
}

// 获取工单信息
export function getWorkorderInfo(incId) {
	return request({
		url: '/workorder/incident/'+incId,
		method: 'get',
	})
}

// 获取当前处理人所在服务站其他人员
export function getStationUserListExcludeMyself(params) {
    return request({
        url: '/system/user/listTransferStationMemberByStationId',
        method: 'get',
        params: params
    })
}

// 工单转派
export function forwardIncTask(data) {
    return request({
        url: '/workorder/incident/transferIncTask',
        method: 'post',
        data:data,
    })
}

// 获取工单流程轨迹相关信息
export function getProgressTrajectoryList(incId) {
    return request({
        url: '/workorder/incident/getIncProcessTrajectoryInfo?incidentId='+ incId,
        method: 'get',
    })
}

// 撤单
export function cancelIncidentSubmission(data) {
    return request({
        url: '/workorder/incident/cancelIncOrder',
        method: 'post',
        data:data,
    })
}

// 拒单
export function refuseIncOrder(data) {
    return request({
        url: '/workorder/incident/refuseIncOrder',
        method: 'post',
        data:data,
    })
}

// 回退
export function incReturnActivity(data) {
    return request({
        url: '/workorder/incident/incReturnActivity',
        method: 'post',
        data:data,
    })
}

// 接单
export function receiveIncident(data) {
    return request({
        url: '/workorder/incident/receiveIncident',
        method: 'post',
        data:data,
    })
}

// 关单
export function closeIncOrder(data) {
    return request({
        url: '/workorder/incident/closeIncOrder',
        method: 'post',
        data:data,
    })
}

// 流程轨迹详情节点展开信息
export function getProgressDetailInfo(incActivityId) {
    return request({
        url: '/workorder/incActivity/values/'+incActivityId,
        method: 'get',
    })
}

// 获取按钮列表
export function getIncidentBtnList(incActivityId) {
    return request({
        url: '/workorder/incident/listButtonInfo/'+incActivityId,
        method: 'get',
    })
}

// 新增工单附件
export function saveIncFileInfo(data) {
	return request({
		url: '/workorder/incident/saveIncFileInfo',
		method: 'post',
		data: data,
	})
}

// 附件信息
export function getIncFileInfo(query) {
	return request({
		url: '/workorder/incident/getIncFileInfo',
		method: 'get',
		params: query,
	})
}

import request from "@/utils/request";

// 获取首页待处理工单数量
export function getPendingWorkorderListInfo(params) {
	return request({
		url: "/workorder/app/countMyPageIncData",
		method: "get",
	});
}

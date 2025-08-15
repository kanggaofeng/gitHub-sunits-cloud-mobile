import request from "@/utils/request";

// 查询OSS对象存储列表
export function listOss(query) {
	return request({
		url: "/system/oss/list",
		method: "get",
		params: query,
	});
}

// 查询OSS对象基于id查询
export function getOss(ossId) {
	return request({
		url: "/system/oss/" + ossId,
		method: "get",
	});
}

// 上传OSS对象存储
export function uploadOssFile(data, onUploadProgress) {
	return request({
		url: "/system/oss/upload",
		method: "post",
		data: data,
		headers: {
			"Content-Type": "multipart/form-data",
		},
		onUploadProgress,
	});
}

// 删除OSS对象存储
export function delOss(ossId) {
	return request({
		url: "/system/oss/" + ossId,
		method: "delete",
	});
}

// 批量删除OSS对象存储
export function delOsss(ossIds) {
	return request({
		url: "/system/oss/batch/" + ossIds,
		method: "delete",
	});
}

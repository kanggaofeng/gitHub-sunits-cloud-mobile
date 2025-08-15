import request from '@/utils/request'

// 获取消息列表
export function getMessageList(query) {
  return request({
    url: '/system/msg/notice/list',
    method: 'get',
    params: query,
  })
}

// 获取消息详情
export function getMessageDetail(id) {
  return request({
    url: `/system/msg/notice/${id}`,
    method: 'get',
  })
}

// 标记消息已读
export function markMessageAsRead(id) {
  return request({
    url: `/system/msg/notice/${id}`,
    method: 'put',
  })
}

// 删除消息
export function deleteMessage(id) {
  return request({
    url: `/system/msg/notice/${id}`,
    method: 'delete',
  })
}

// 批量标记已读
export function batchMarkAsRead(ids) {
  return request({
    url: '/system/msg/notice/batch-read',
    method: 'put',
    data: { ids },
  })
}

// 获取未读消息数量
export function getUnreadCount() {
  return request({
    url: '/system/msg/notice/countUnreadMsgNotice',
    method: 'get',
  })
}
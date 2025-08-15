<template>
  <view class="history-container">
    <CustomNavBar title="通知消息" :back="true" />
    <workorder-scroller :dataSource="scrollerData" emptyText="暂无历史记录" :refresherEnabled="false">
      <div v-if="scrollerData.list && scrollerData.list.length > 0" class="history-card-container">
        <ul class="messages-list">
          <li v-for="item in scrollerData.list" :key="item.id" class="message-item" :class="{ unread: item.readState === '0' }" @click="handleMessageClick(item)">
            <span class="tag" :class="getTagClass(item.type)">{{ getTagLabel(item.type) }}</span>
            <span class="content" :title="item.content">{{ item.content || '暂无内容' }}</span>
            <span class="date">{{ formatDate(item.createTime) }}</span>
            <span v-if="item.readState === '0'" class="unread-dot"></span>
          </li>
        </ul>
      </div>
    </workorder-scroller>

    <!-- 使用消息详情弹窗组件 -->
    <MessageDetailPopup :message="currentMessage" @jump="handlePopupJump" ref="messageDetailPopupRef" />
  </view>
</template>

<script setup>
import WorkorderScroller from '@/components/workorder-scroller/workorder-scroller.vue'
import { useScroller } from '@/components/workorder-scroller/useScroller'
import { getMessageList, markMessageAsRead, batchMarkAsRead } from '@/api/system/msgNotice'
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
// 引入新组件
import MessageDetailPopup from './MessageDetailPopup.vue'

const router = useRouter()
const { proxy } = getCurrentInstance()

// 弹窗引用
const messageDetailPopupRef = ref(null)
const currentMessage = ref({})

// 分页服务
const scrollerData = useScroller({
  fetchService: (params) => {
    return getMessageList({ ...params, pageSize: 20 })
  },
  useCache: false,
  isAllRefresh: true,
  cacheKey: () => `通知消息`,
})

// 默认消息类型映射
const defaultTypeMap = {
  0: { tag: '置顶', type: 'danger' },
  1: { tag: '功能', type: 'primary' },
}

// 消息类型映射
const getMessageTypeInfo = (type) => {
  // 使用字典获取消息类型信息
  const dictData = proxy.getAllDict('msg_notice_type')
  if (dictData && dictData.length > 0) {
    const typeItem = dictData.find((item) => item.value === type)
    if (typeItem) {
      return {
        tag: typeItem.label,
        tagType: typeItem.elTagType,
      }
    }
  }
  return defaultTypeMap[type] || { tag: '通知', tagType: 'notice' }
}

// 获取标签样式类
const getTagClass = (type) => {
  const typeInfo = getMessageTypeInfo(type)
  return typeInfo.tagType
}

// 获取标签文本
const getTagLabel = (type) => {
  const typeInfo = getMessageTypeInfo(type)
  return typeInfo.tag
}

// 添加格式化日期函数
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    return '昨天'
  } else if (diffDays === 0) {
    return '今天'
  } else if (diffDays <= 7) {
    return `${diffDays}天前`
  } else {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })} ${hours}:${minutes}`
  }
}

// 修改处理消息点击的函数
const handleMessageClick = async (item) => {
  // 如果消息未读，标记为已读
  if (item.readState === '0') {
    await markMessageAsRead(item.id)
    item.readState = '1'
  }

  // 设置当前消息并显示弹窗
  currentMessage.value = {
    ...item,
    title: item.subject || '消息详情',
    canJump: item.type === '1',
  }
  
  // 使用引用打开弹窗
  nextTick(() => {
    if (messageDetailPopupRef.value) {
      messageDetailPopupRef.value.open()
    }
  })
}

// 添加处理弹窗跳转函数
const handlePopupJump = (message) => {
  if (message.businessId) {
    uni.navigateTo({
      url: `/pages/workorder-detail/workorder-detail?id=${message.businessId}`,
    })
  }
}
</script>

<style lang="scss" scoped>
// 容器样式
.history-container {
  background: #f8fafc;
  height: calc(100vh - 44px);

  .history-card-container {
    padding: 10px;
  }
}

// 消息列表样式
.messages-list {
  list-style: none;
  padding: 0;
  margin: 0;

  .message-item {
    display: flex;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s;
    position: relative;
    background: #ffffff;
    border-radius: 8px;
    margin-bottom: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      background-color: #f8f9fa;
    }

    &.unread {
      .content {
        font-weight: 600;
      }
    }

    .tag {
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: 500;
      margin-right: 12px;
      flex-shrink: 0;

      &.danger {
        background-color: #ffebee;
        color: #d32f2f;
      }

      &.primary {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      &.notice {
        background-color: #e8f5e8;
        color: #388e3c;
      }

      &.warning {
        background-color: #fff3e0;
        color: #f57c00;
      }
    }

    .content {
      flex: 1;
      color: #333;
      font-size: 14px;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 12px;
    }

    .date {
      color: #999;
      font-size: 12px;
      flex-shrink: 0;
      margin-right: 8px;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      background-color: #1871f6;
      border-radius: 50%;
      flex-shrink: 0;
    }
  }
}
</style>

<template>
  <view class="bottom-cards">
    <view class="card-view">
      <!-- 卡片标题 -->
      <view class="card-title-div">
        <view class="title-left">
          <image class="notice-image" src="/static/images/index/notice.png" />
          <text class="card-title">{{ totalUnreadCount }}条未读</text>
        </view>
        <view class="card-link" @click="handleViewMore">
          更多
          <uni-icons type="forward" size="12" color="#3f3f7a" />
        </view>
      </view>

      <!-- 轮播消息 -->
      <view class="swiper-view">
        <uni-swiper-dot
          :info="swipePages"
          :current="current"
          mode="round"
          :dotsStyles="{
            backgroundColor: '#CCD0D7',
            selectedBackgroundColor: '#2F6AFE',
            width: '6px',
            border: 'none',
            selectedBorder: 'none',
          }"
        >
          <swiper class="swiper-box" @change="change" :current="current" circular autoplay>
            <swiper-item v-for="(page, pageIndex) in swipePages" :key="pageIndex">
              <view v-for="msg in page" :key="msg.id" class="swiper-item" :class="{ unread: msg.readState === '1' }" @click="handleMessageClick(msg)">
                <view class="card-content">
                  <text class="card-content-text">{{ msg.content }}</text>
                  <view class="card-content-time-view">
                    <text class="card-content-time">{{ formatDate(msg.createTime) }}</text>
                    <uni-icons type="forward" size="12" color="#3f3f7a" />
                    <!-- <uni-icons type="forward" size="12" :color="msg.readState === '1' ? '#cccccc' : '#3f3f7a'" /> -->
                  </view>
                </view>
              </view>
            </swiper-item>
          </swiper>
        </uni-swiper-dot>
      </view>
    </view>

    <!-- 使用消息详情弹窗组件 -->
    <MessageDetailPopup :message="currentMessage" @jump="handlePopupJump" ref="messageDetailPopupRef" />
  </view>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { getMessageList, markMessageAsRead, getUnreadCount } from '@/api/system/msgNotice'
// 引入消息详情弹窗组件
import MessageDetailPopup from './MessageDetailPopup.vue'

// 轮播当前页
const current = ref(0)
const change = (e) => {
  current.value = e.detail.current
}

// 消息数据
const messages = ref([])
const totalUnreadCount = ref(0)

// 弹窗引用
const messageDetailPopupRef = ref(null)
const currentMessage = ref({})

// 获取未读数量
const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    totalUnreadCount.value = res.data || 0
  } catch (error) {
    console.error('获取未读消息数量失败', error)
    totalUnreadCount.value = 0
  }
}

// 获取消息列表
const getMessageListData = async () => {
  try {
    const response = await getMessageList({ pageSize: 6, pageNum: 1 })
    messages.value = response.rows || []
    fetchUnreadCount()
  } catch (error) {
    console.error('获取消息列表失败', error)
    messages.value = []
  }
}

// 格式化时间
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return '昨天'
  if (diffDays === 0) return '今天'
  if (diffDays <= 7) return `${diffDays}天前`

  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
}

// 分页：每页3条
const swipePages = computed(() => {
  const size = 3
  const result = []
  for (let i = 0; i < messages.value.length; i += size) {
    result.push(messages.value.slice(i, i + size))
  }
  return result.length > 0 ? result : [[]]
})

// 标记为已读
const markMessageAsReadData = async (id) => {
  try {
    await markMessageAsRead(id)
    return true
  } catch (error) {
    console.error('标记已读失败', error)
    return false
  }
}

// 点击消息
const handleMessageClick = async (msg) => {
  if (msg.readState === '0') {
    const success = await markMessageAsReadData(msg.id)
    if (success) {
      msg.readState = '1'
      const index = messages.value.findIndex((m) => m.id === msg.id)
      if (index > -1) messages.value[index].readState = '1'
      fetchUnreadCount()
    }
  }

  // 设置当前消息并显示弹窗
  currentMessage.value = {
    ...msg,
    title: '消息详情',
    canJump: msg.type === '1',
  }

  // 使用引用打开弹窗
  nextTick(() => {
    if (messageDetailPopupRef.value) {
      messageDetailPopupRef.value.open()
    }
  })
}

// 处理弹窗跳转
const handlePopupJump = (message) => {
  if (message.businessId) {
    uni.navigateTo({
      url: `/pages/workorder-detail/workorder-detail?id=${message.businessId}`,
    })
  }
}

// 查看更多
const handleViewMore = () => {
  uni.navigateTo({
    url: '/pages/tabBar/home/messageListPage',
  })
}

// 使用标志变量避免重复加载
const isFirstLoad = ref(true)
onActivated(() => {
  // 只有非首次激活时才执行
  if (!isFirstLoad.value) {
    getMessageListData()
  }
  // 重置标志，表示已经不是首次加载了
  isFirstLoad.value = false
})
// 初始化
onMounted(() => {
  getMessageListData()
  isFirstLoad.value = false
})
</script>

<style lang="scss" scoped>
.bottom-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 2px;
  background: #ffffff;
  border-radius: 10px;

  .card-view {
    flex: 1 1 45%;
    padding: 10px;
    margin: 0;
    background: linear-gradient(180deg, #e3f2ff 0%, #ffffff 30%);
    border-radius: 10px;
    height: 150px;

    .card-title-div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 30px;

      .title-left {
        display: flex;
        align-items: center;

        .notice-image {
          width: 45px;
          height: 20px;
        }

        .card-title {
          background: linear-gradient(270deg, #ffa810, #ff850f);
          color: #fff;
          font:
            500 11px/16px 'PingFangSC',
            'PingFang SC';
          padding: 0 5px 0 4px;
          border-radius: 3px;
          margin-left: 5px;
          text-align: center;
        }
      }

      .card-link {
        font:
          400 12px/14px 'PingFangSC',
          'PingFang SC';
        color: #949aa7;
        display: flex;
        align-items: center;
        margin-left: 3px;
      }
    }

    .swiper-view {
      height: 110px;

      .swiper-box {
        padding: 0 5px 0 0;
        height: 100%;
      }

      .uni-swiper__warp {
        height: 110px;
      }

      .swiper-item {
        font-weight: 600;
        &.unread {
          .card-content-text {
            font-weight: normal;
            color: #cccccc;
          }
        }
      }

      .card-content {
        margin-top: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-content-text {
          font:
            500 13px/18px 'PingFangSC',
            'PingFang SC';
          color: #1e2024;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-right: 10px;
        }

        .card-content-time-view {
          display: flex;
          align-items: center;
          white-space: nowrap;

          .card-content-time {
            font:
              400 12px/18px 'PingFangSC',
              'PingFang SC';
            color: #9298a7;
          }

          .uni-icons {
            width: 14px;
            height: 14px;
            background: #e3f2ff;
            border-radius: 4px;
            margin-left: 5px;
          }
        }
      }
    }
  }
}
</style>

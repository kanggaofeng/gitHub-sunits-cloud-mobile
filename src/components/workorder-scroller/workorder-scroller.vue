<template>
  <view class="workorder-scroller">
    <!-- 有数据时显示滚动列表 -->
    <scroll-view
      v-if="!isEmpty"
      :id="`scroller-${tabId || 'default'}`"
      scroll-y
      :refresher-enabled="props.refresherEnabled"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="handleRefresh"
      @scrolltolower="handleLoadMore"
      :show-scrollbar="false"
      enable-flex="true"
      :scroll-with-animation="false"
      :style="{ height: scrollHeight }"
    >
      <slot></slot>

      <!-- 加载更多 -->
      <view class="load-more-wrapper">
        <uni-load-more :status="loadingStatus" :content-text="contentText" />
      </view>
    </scroll-view>

    <!-- 空数据状态 -->
    <view v-else class="empty-state" @click="handleRefresh">
      <image src="/static/empty.png" mode="aspectFit" class="empty-image"></image>
      <text class="empty-text">{{ emptyText }}</text>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  scrollHeight: { type: String, default: '100%' },
  dataSource: { type: Object, default: null },
  emptyText: { type: String, default: '暂无工单数据' },
  tabId: { type: [String, Number], default: '' },
  refresherEnabled: { type: Boolean, default: true },
})

const emit = defineEmits(['loadMore', 'allRefresh'])

// 下拉刷新状态
const isRefreshingData = ref(false)
const isRefreshing = computed(() => isRefreshingData.value)

// 从dataSource获取状态
const isEmpty = computed(() => (props.dataSource && props.dataSource.isEmpty) || false)
const loadingStatus = computed(() => (props.dataSource && props.dataSource.loadingStatus) || 'more')

// 加载更多文本配置
const contentText = {
  contentdown: '上拉显示更多',
  contentrefresh: '正在加载...',
  contentnomore: '没有更多数据了',
}

// 加载更多处理
const handleLoadMore = () => {
  if (loadingStatus.value === 'loading') return
  if (props.dataSource && props.dataSource.loadMore) {
    props.dataSource.loadMore()
  } else {
    emit('loadMore')
  }
}

// 下拉刷新处理
const handleRefresh = async () => {
  isRefreshingData.value = true
  try {
    if (!props.dataSource?.isAllRefresh()) {
      await props.dataSource.refresh()
    } else {
      await emit('allRefresh') // 假设父组件返回 Promise
    }
  } finally {
    isRefreshingData.value = false
  }
}

// 清除缓存
const clearCache = () => {
  if (props.dataSource && props.dataSource.clearCache) {
    props.dataSource.clearCache(props.tabId)
  }
}

// 向外暴露方法
defineExpose({})
</script>

<style lang="scss" scoped>
.workorder-scroller {
  width: 100%;

  .load-more-wrapper {
    padding: 15px 0;
  }

  .empty-state {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: -150px;

    .empty-image {
      width: 120px;
      height: 120px;
      margin-bottom: 15px;
    }

    .empty-text {
      font-size: 14px;
      color: #999;
    }
  }
}
</style>

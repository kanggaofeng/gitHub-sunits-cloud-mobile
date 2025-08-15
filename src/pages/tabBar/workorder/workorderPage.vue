<template>
  <view class="workorder-container">
    <!-- 顶部标签栏 - 固定不动部分 -->
    <view class="status-bar"></view>
    <view class="workorder-tabs">
      <view class="tabs-header">
        <view class="main-tabs">
          <view class="main-tab-item" :class="{ active: activeMainTab === 'processing' }" @click="switchMainTab('processing')">
            <text>待处理</text>
            <view class="main-tab-badge" v-if="tabCounts && tabCounts.processing">{{ tabCounts.processing }}</view>
          </view>
          <view class="main-tab-item" :class="{ active: activeMainTab === 'history' }" @click="switchMainTab('history')">
            <text>历史工单</text>
            <view class="main-tab-badge" v-if="tabCounts && tabCounts.history">{{ tabCounts.history }}</view>
          </view>
        </view>
        <view class="search-icon">
          <input type="input" class="search-input" placeholder="搜索" v-model="searchKeyword" />
          <DsSvgIcon icon="icon-guanbi" class="icon-guanbi" v-if="searchKeyword" @click="clearSearch" />
          <DsSvgIcon icon="icon-sousuo" class="icon-sousuo" @click="handleSearch" />
        </view>
      </view>

      <!-- 子标签栏 - 只在待处理工单时显示 -->
      <scroll-view v-if="activeMainTab === 'processing'" scroll-x class="sub-tabs-scroll" :show-scrollbar="false">
        <view class="sub-tabs-list">
          <view v-for="(tab, index) in processingTabs" :key="index" class="sub-tab-item" :class="{ active: currentTabIndex === index }" @click="switchTab(index)">
            <text class="tab-text">{{ tab.name }}</text>
            <view class="sub-tab-badge" v-if="tab && tab.count">{{ tab.count }}</view>
          </view>
        </view>
      </scroll-view>
    </view>
    <!-- 筛选条件 -->
    <view class="filter-bar">
      <view class="filter-item" @click="toggleFilter('createTime')">
        <div>开单时间</div>
        <view class="filter-icon">
          <DsSvgIcon icon="icon-a-shaixuan3" :class="{ searchActive: sortOrder === 'desc' && sortField === 'create_time' }" />
          <DsSvgIcon icon="icon-a-shaixuan2" :class="{ searchActive: sortOrder === 'asc' && sortField === 'create_time' }" />
        </view>
      </view>
      <view class="filter-item" @click="toggleFilter('visitTime')">
        <div>上门时间</div>
        <view class="filter-icon">
          <DsSvgIcon icon="icon-a-shaixuan3" :class="{ searchActive: sortOrder === 'desc' && sortField === 'appoint_expect_time' }" />
          <DsSvgIcon icon="icon-a-shaixuan2" :class="{ searchActive: sortOrder === 'asc' && sortField === 'appoint_expect_time' }" />
        </view>
      </view>
    </view>

    <!-- 工单滚动列表区域 -->
    <view class="content-wrapper">
      <!-- 处理中工单 -->
      <template v-if="activeMainTab === 'processing'">
        <swiper class="swiper-container" :current="currentTabIndex" @change="handleSwiperChange">
          <swiper-item v-for="(tab, index) in processingTabs" :key="`processing-${index}`">
            <workorder-scroller :dataSource="getScrollerDataForTab(index)" :tabId="`processing-${index}`" @allRefresh="refreshAllTabs">
              <template v-if="getScrollerDataForTab(index).list && getScrollerDataForTab(index).list.length > 0">
                <!-- 针对已撤单标签使用专用卡片组件 -->
                <template v-if="index === 3">
                  <CanceledWorkorderCard
                    v-for="(workorder, i) in getScrollerDataForTab(index).list"
                    :key="workorder && workorder.id ? `canceled-${workorder.id}` : `canceled-index-${i}`"
                    :workorder="workorder || {}"
                    @acknowledge="handleWorkOrderAcknowledge"
                  ></CanceledWorkorderCard>
                </template>
                <!-- 其他标签使用常规工单卡片组件 -->
                <template v-else>
                  <workorder-card
                    v-for="(workorder, i) in getScrollerDataForTab(index).list"
                    :key="workorder && workorder.id ? `normal-${workorder.id}` : `normal-index-${i}`"
                    :workorder="workorder || {}"
                    :tabIndex="index"
                    @allRefresh="refreshAllTabs"
                  ></workorder-card>
                </template>
              </template>
            </workorder-scroller>
          </swiper-item>
        </swiper>
      </template>

      <!-- 历史工单 -->
      <workorder-scroller v-show="activeMainTab === 'history'" :dataSource="historyScrollerData" key="history-0" tabId="history-0" @allRefresh="refreshAllTabs">
        <template v-if="historyScrollerData.list && historyScrollerData.list.length > 0">
          <workorder-card
            v-for="(workorder, index) in historyScrollerData.list"
            :key="workorder && workorder.id ? `history-${workorder.id}` : `history-index-${index}`"
            :workorder="workorder || {}"
            :tabIndex="4"
            @allRefresh="refreshAllTabs"
          ></workorder-card>
        </template>
      </workorder-scroller>
    </view>
  </view>
</template>

<script setup>
import WorkorderScroller from '@/components/workorder-scroller/workorder-scroller.vue'
import WorkorderCard from '@/components/workorder-card/workorder-card.vue'
import CanceledWorkorderCard from '@/components/workorder-card/canceled-workorder-card.vue'
import { getWorkOrderList, getWorkOrderStatusCount } from '@/api/workorder'
import { useScroller } from '@/components/workorder-scroller/useScroller'
import useWorkOrderStore from '@/store/modules/workOrder'

const workOrderStore = useWorkOrderStore()

onShow(() => {
  const tabConfig = uni.getStorageSync('workorderTab')
  if (tabConfig) {
    activeMainTab.value = tabConfig.mainTab || 'processing'
    currentTabIndex.value = typeof tabConfig.subTab === 'number' ? tabConfig.subTab : 0
    uni.removeStorageSync('workorderTab') // 用完立即清除，避免下次重复触发
  }
  // 当 workOrderStore.isWorkerListRefresh 为 true 时重新加载所有数据
  if (workOrderStore.isWorkerListRefresh) {
    // 重置刷新状态
    workOrderStore.isWorkerListRefresh = false
    // 全量刷新
    refreshAllTabs()
  }
})

// 主标签状态
const activeMainTab = ref('processing') // 'processing'或'history'

// 标签页数据
const processingTabs = ref([
  {
    name: '待接单',
    count: 0,
    searchOrder: {
      sortField: 'create_time',
      sortOrder: 'desc',
    },
  },
  {
    name: '进行中',
    count: 0,
    searchOrder: {
      sortField: 'create_time',
      sortOrder: 'desc',
    },
  },
  {
    name: '审核中',
    count: 0,
    searchOrder: {
      sortField: 'create_time',
      sortOrder: 'desc',
    },
  },
  {
    name: '已撤单',
    count: 0,
    searchOrder: {
      sortField: 'create_time',
      sortOrder: 'desc',
    },
  },
])

// 标签计数
const tabCounts = ref({
  processing: 0,
  history: 0,
})

// 当前选中的标签索引
const currentTabIndex = ref(0)

// 当前标签ID，用于API请求
const tabId = ref(0)

// 加载工单状态数量
const loadWorkOrderStatusCount = async () => {
  try {
    const res = await getWorkOrderStatusCount({
      incidentCode: searchKeyword.value,
    })
    if (res.code === 200 && res.data) {
      // 更新待处理数量
      const processingCount = res.data.countTobeAccepted + res.data.countProcessing + res.data.countApprove + res.data.countCancel
      tabCounts.value.processing = processingCount

      // 更新历史工单数量
      tabCounts.value.history = res.data.countHistory || 0

      // 更新各个标签页数量
      processingTabs.value[0].count = res.data.countTobeAccepted || 0
      processingTabs.value[1].count = res.data.countProcessing || 0
      processingTabs.value[2].count = res.data.countApprove || 0
      processingTabs.value[3].count = res.data.countCancel || 0
    }
  } catch (error) {
    console.error('加载工单状态数量失败:', error)
  }
}

// 历史工单排序设置
const historySearchOrder = ref({
  sortField: 'create_time',
  sortOrder: 'desc',
})

// 为每个标签页创建独立的数据源
const tabScrollerData = ref([
  useScroller({
    fetchService: createFetchService(0),
    useCache: true,
    isAllRefresh: true,
    cacheKey: () => `workorder-processing-0`,
  }),
  useScroller({
    fetchService: createFetchService(1),
    useCache: true,
    isAllRefresh: true,
    cacheKey: () => `workorder-processing-1`,
  }),
  useScroller({
    fetchService: createFetchService(2),
    useCache: true,
    isAllRefresh: true,
    cacheKey: () => `workorder-processing-2`,
  }),
  useScroller({
    fetchService: createFetchService(3),
    useCache: true,
    isAllRefresh: true,
    cacheKey: () => `workorder-processing-3`,
  }),
])

// 历史工单数据源
const historyScrollerData = useScroller({
  fetchService: createFetchService(4),
  useCache: true,
  isAllRefresh: true,
  cacheKey: () => `workorder-history-0`,
})

// 创建获取数据的服务函数
function createFetchService(fixedTabId) {
  return (params) => {
    // 使用固定的tabId（如果提供）或当前活动的tabId
    const currentTabId = fixedTabId !== undefined ? fixedTabId : tabId.value

    // 确定当前标签的排序设置
    const currentTab = currentTabId === 4 ? historySearchOrder.value : processingTabs.value[currentTabId]?.searchOrder || processingTabs.value[0].searchOrder

    // 返回请求
    return getWorkOrderList({
      pageNum: params.pageNum || params.page,
      pageSize: params.pageSize,
      tabId: currentTabId,
      'params[sortField]': params['params[sortField]'] || currentTab.sortField,
      'params[sortOrder]': params['params[sortOrder]'] || currentTab.sortOrder,
      // 添加搜索关键词 - 优先使用参数中的关键词，如果没有则使用全局搜索关键词
      incidentCode: params.incidentCode !== undefined ? params.incidentCode : searchKeyword.value,
    })
  }
}

// 获取指定标签页的数据源
const getScrollerDataForTab = (index) => {
  return tabScrollerData.value[index]
}

// 搜索相关
const searchKeyword = ref('')

// 历史工单筛选条件
const historyFilter = ref({
  timeRange: '',
  serviceType: '',
})

// 获取当前标签页的排序设置
const getCurrentSortSettings = () => {
  if (activeMainTab.value === 'processing') {
    return processingTabs.value[currentTabIndex.value].searchOrder
  } else {
    return historySearchOrder.value
  }
}

// 切换处理中工单标签
const switchProcessingTab = (index) => {
  if (currentTabIndex.value !== index) {
    currentTabIndex.value = index
    tabId.value = index

    // 获取当前选中标签的排序设置
    const currentTab = processingTabs.value[index].searchOrder

    // 更新UI显示的排序值
    sortField.value = currentTab.sortField
    sortOrder.value = currentTab.sortOrder

    // 切换标签并传递排序参数
    const params = {
      tabId: index,
      'params[sortField]': currentTab.sortField,
      'params[sortOrder]': currentTab.sortOrder,
      incidentCode: searchKeyword.value, // 传递搜索关键词
    }

    // 切换标签时更新数据
    tabScrollerData.value[index].switchTab(params)

    // 更新工单状态数量
    loadWorkOrderStatusCount()
  }
}

// 切换标签 - 给UI点击事件使用
const switchTab = (index) => {
  switchProcessingTab(index)
}

// 处理swiper切换
const handleSwiperChange = (e) => {
  switchProcessingTab(e.detail.current)
}

// 切换主标签
const switchMainTab = (tab) => {
  if (activeMainTab.value !== tab) {
    activeMainTab.value = tab

    // 设置当前标签ID
    tabId.value = tab === 'processing' ? currentTabIndex.value : 4

    // 获取当前选中标签的排序设置
    const currentTab = tab === 'processing' ? processingTabs.value[currentTabIndex.value].searchOrder : historySearchOrder.value

    // 更新UI显示的排序值
    sortField.value = currentTab.sortField
    sortOrder.value = currentTab.sortOrder

    // 切换标签并传递排序参数
    const params = {
      tabId: tabId.value,
      'params[sortField]': currentTab.sortField,
      'params[sortOrder]': currentTab.sortOrder,
      incidentCode: searchKeyword.value, // 传递搜索关键词
    }

    // 切换标签时更新数据
    if (tab === 'processing') {
      tabScrollerData.value[currentTabIndex.value].switchTab(params)
    } else {
      historyScrollerData.switchTab(params)
    }

    // 更新工单状态数量
    loadWorkOrderStatusCount()
  }
}

// 搜索方法，重置所有标签页的缓存，只请求一次工单状态数量
const handleSearch = () => {
  const searchParams = {
    incidentCode: searchKeyword.value,
  }
  refreshAllTabs()
}

// 切换筛选条件
const toggleFilter = (type) => {
  // 获取当前标签的排序设置
  const currentTab = activeMainTab.value === 'processing' ? processingTabs.value[currentTabIndex.value].searchOrder : historySearchOrder.value

  // 根据筛选类型切换排序
  if (type === 'createTime') {
    currentTab.sortField = 'create_time'
    currentTab.sortOrder = currentTab.sortOrder === 'desc' ? 'asc' : 'desc'
  }
  if (type === 'visitTime') {
    currentTab.sortField = 'appoint_expect_time'
    currentTab.sortOrder = currentTab.sortOrder === 'desc' ? 'asc' : 'desc'
  }

  // 更新UI显示
  sortField.value = currentTab.sortField
  sortOrder.value = currentTab.sortOrder

  // 创建查询参数
  const params = {
    'params[sortField]': currentTab.sortField,
    'params[sortOrder]': currentTab.sortOrder,
    incidentCode: searchKeyword.value, // 保持搜索关键词
  }

  // 重新加载当前标签页数据
  if (activeMainTab.value === 'processing') {
    tabScrollerData.value[currentTabIndex.value].updateQueryParams(params)
  } else {
    historyScrollerData.updateQueryParams(params)
  }

  // 单独调用一次状态计数接口
  loadWorkOrderStatusCount()
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
  handleSearch()
}

// 处理工单已知晓按钮点击事件
const handleWorkOrderAcknowledge = (workorder) => {
  if (!workorder || !workorder.id) return

  if (activeMainTab.value === 'processing' && currentTabIndex.value === 3) {
    // 直接删缓存和 list
    const scroller = tabScrollerData.value[currentTabIndex.value]
    if (scroller && typeof scroller.removeItemById === 'function') {
      scroller.removeItemById(workorder.id)

      // 如果删除后列表长度为0，刷新当前接口
      if (scroller.list && scroller.list.length === 0) {
        scroller.refresh()
      }
    }
  }

  loadWorkOrderStatusCount()
}

// 全量刷新所有tab和历史工单tab
const refreshAllTabs = async () => {
  for (const scroller of tabScrollerData.value) {
    scroller.clearCache()
    scroller.resetPagination()
    scroller.updateQueryParams({ incidentCode: searchKeyword.value })
  }
  historyScrollerData.clearCache()
  historyScrollerData.resetPagination()
  historyScrollerData.updateQueryParams({ incidentCode: searchKeyword.value })
  loadWorkOrderStatusCount()
}

const sortField = ref('create_time') // 当前排序字段: 'create_time' 或 'appoint_expect_time'
const sortOrder = ref('desc') // 当前排序顺序: 'asc' 或 'desc'

onLoad(() => {
  // 初始化tabId为当前标签索引
  loadWorkOrderStatusCount()
  tabId.value = currentTabIndex.value
})
</script>

<style lang="scss" scoped>
@import './workorder.scss';
</style>

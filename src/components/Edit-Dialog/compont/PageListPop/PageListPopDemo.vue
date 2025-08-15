<template>
  <view>
    <uni-popup ref="popup" type="bottom" @close="handleClose">
      <view class="popup-container">
        <!-- 顶部标题栏 -->
        <view class="popup-header">
          <text class="popup-title">进行中列表</text>
          <text class="popup-close" @tap="handleClose">×</text>
        </view>

        <!-- 搜索栏 -->
        <view class="search-bar">
          <view class="search-input-wrapper">
            <input type="text" v-model="searchKeyword" placeholder="搜索工单号" />
            <DsSvgIcon icon="icon-guanbi" class="icon-guanbi" v-if="searchKeyword" @click="clearSearch" />
            <DsSvgIcon icon="icon-sousuo" class="icon-sousuo" @click="handleQuery" />
          </view>
        </view>

        <!-- 使用WorkorderScroller组件 -->
        <workorder-scroller :dataSource="scrollerData" class="order-scroller" tabId="pending-orders">
          <view v-for="(item, index) in filteredList" :key="item.id || index" class="order-item" :class="{ active: selectedItem?.id === item.id }" @tap="handleItemClick(item)">
            <view class="order-info">
              <view class="order-name">{{ item.incidentCode || '未知工单号' }}</view>
              <view class="order-desc">
                <text>创建时间: {{ item.createTime || '' }}</text>
              </view>
              <view class="order-desc">
                <text>问题描述: {{ item.problemDescription || '无描述' }}</text>
              </view>
            </view>
            <view class="checkboxList" :class="{ selectChecked: selectedItem?.id === item.id }">
              <text v-if="selectedItem?.id === item.id" class="check-icon">✓</text>
            </view>
          </view>
        </workorder-scroller>

        <!-- 底部按钮 -->
        <view class="popup-footer">
          <button class="btn-cancel" @tap="handleClose">取消</button>
          <button class="btn-confirm" @tap="handleConfirm">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import WorkorderScroller from '@/components/workorder-scroller/workorder-scroller.vue'
import { useScroller } from '@/components/workorder-scroller/useScroller'
import { getWorkOrderList, getWorkOrderStatusCount } from '@/api/workorder'

// 搜索关键词
const searchKeyword = ref('')
// 弹框引用
const popup = ref(null)
// 选中的项目
const selectedItem = ref(null)

// 使用滚动加载钩子
const scrollerData = useScroller({
  fetchService: (params) => {
    return getWorkOrderList({
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      tabId: 1, // 0表示待接单
      'params[sortField]': 'create_time',
      'params[sortOrder]': 'desc',
    })
  },
  statusCountService: getWorkOrderStatusCount,
  useCache: true,
  cacheKey: () => 'pending-orders',
})

// 根据搜索过滤列表
const filteredList = computed(() => {
  // 搜索功能已经在接口层面处理，这里直接返回列表数据
  return scrollerData.list
})

// 点击列表项
const handleItemClick = (item) => {
  selectedItem.value = item
}

// 关闭弹框
const handleClose = () => {
  popup.value.close()
}

// 确认选择
const handleConfirm = () => {
  if (selectedItem.value) {
    emit('select', selectedItem.value)
  }
  popup.value.close()
}

// 处理搜索按钮点击
const handleSearch = () => {
  // 调用接口搜索
  scrollerData.updateQueryParams({
    incidentCode: searchKeyword.value,
    // 添加时间戳确保每次都视为新查询
    _t: Date.now(),
  })
}

// 清空搜索内容
const clearSearch = () => {
  searchKeyword.value = ''

  // 如果之前有搜索内容，重置搜索
  scrollerData.updateQueryParams({
    incidentCode: '',
  })
}

// 打开弹框
const open = (preSelectedId) => {
  // 如果有预选ID，设置选中项
  if (preSelectedId) {
    const found = scrollerData.list.find((item) => item.id === preSelectedId)
    if (found) {
      selectedItem.value = found
    }
  } else {
    selectedItem.value = null
  }

  // 如果没有数据，加载数据
  if (scrollerData.list.length === 0) {
    scrollerData.refresh()
  }

  popup.value.open()
}

// 对外暴露方法
defineExpose({
  open,
})

// 定义事件
const emit = defineEmits(['select'])

// 组件挂载时预加载数据
onMounted(() => {
  scrollerData.refresh()
})
</script>

<style lang="scss" scoped>
@import '~@/components/Edit-Dialog/compont/PageListPop/fenYePop.scss';
</style>

<template>
  <uni-popup ref="popup" type="bottom" @close="handleClose">
    <view class="popup-container">
      <!-- 顶部标题栏 -->
      <view class="popup-header">
        <text class="popup-title">选择服务站点</text>
        <text class="popup-close" @tap="handleClose">×</text>
      </view>

      <!-- 搜索栏 -->
      <view class="search-bar">
        <view class="search-input-wrapper">
          <input type="text" v-model="queryParams.stationCode" placeholder="搜索站点编号" />
          <DsSvgIcon icon="icon-guanbi" class="icon-guanbi"  v-if="queryParams.stationCode" @click="clearSearch" />
          <DsSvgIcon icon="icon-sousuo" class="icon-sousuo" @click="handleQuery" />
        </view>
      </view>
      <!-- 使用WorkorderScroller组件 -->
      <workorder-scroller :dataSource="scrollerData" class="order-scroller" tabId="service-stations" :key="renderKey">
        <view
          v-for="(item, index) in scrollerData.list"
          :key="item.id || index"
          class="order-item"
          :class="{ active: selectedItem?.id === item.id }"
          @tap="handleItemClick(item)"
        >
          <view class="order-info">
            <view class="order-name">{{ item.stationName || item.stationNameFull || '未知站点' }}</view>
            <view class="order-desc">
              <text>8位站编号: {{ item.stationCode || '无编码' }}</text>
            </view>
            <view class="order-desc">
              <text>地址: {{ item.address || '' }}</text>
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
</template>

<script setup>
import { getStationList, hqDirectControSpecifyTheScope } from '@/api/create-newwork-orderpage/createNewWorkOrderPageApi.js'
import WorkorderScroller from '@/components/workorder-scroller/workorder-scroller.vue'
import { useScroller } from '@/components/workorder-scroller/useScroller'

// 弹框引用
const popup = ref(null)
// 选中的项目
const selectedItem = ref(null)
// API调用函数
const stationListApi = ref(getStationList)
// 查询参数
const queryParams = ref({
  stationCode: '',
  stationName: '',
  status: '0',
  projectId: '',
  processId: '',
  province: '',
  city: '',
  county: '',
})

// 强制刷新标记
const renderKey = ref(0)

// 使用滚动加载钩子，参考PageListPopDemo.vue的实现
const scrollerData = useScroller({
  fetchService: (params) => {
    // 注意：这里不要展开queryParams，而是直接使用params并添加其他参数
    return stationListApi
      .value({
        pageNum: params.pageNum,
        pageSize: params.pageSize,
        stationCode: queryParams.value.stationCode,
        stationName: queryParams.value.stationName,
        status: queryParams.value.status,
        projectId: queryParams.value.projectId,
        processId: queryParams.value.processId,
        province: queryParams.value.province,
        city: queryParams.value.city,
        county: queryParams.value.county,
      })
      .then((res) => {
        // 如果有已选择的服务站ID，尝试在返回结果中找到它
        if (selectedStationId.value && res.rows && res.rows.length > 0) {
          // 简化匹配逻辑
          const previouslySelectedRow = res.rows.find((row) => row.id === selectedStationId.value || row.stationId === selectedStationId.value)

          if (previouslySelectedRow) {
            selectedItem.value = previouslySelectedRow
          }
        }
        return res
      })
  },
  useCache: false,
  cacheKey: () => 'service-stations',
  immediate: false,
})

// 保存选中服务站ID
const selectedStationId = ref('')

// 点击列表项
const handleItemClick = (item) => {
  // 清除之前的选择，只保留当前选中项
  if (selectedItem.value && selectedItem.value.id === item.id) {
    // 如果点击的是当前已选中项，则取消选择
    selectedItem.value = null
  } else {
    // 选中当前项
    selectedItem.value = item
  }
}

// 关闭弹框
const handleClose = () => {
  popup.value.close()
}

// 确认选择
const handleConfirm = () => {
  if (selectedItem.value) {
    // 简化返回对象，只确保基本必要字段
    const result = {
      ...selectedItem.value,
      id: selectedItem.value.id || '',
      stationId: selectedItem.value.stationId || selectedItem.value.id || '',
      stationName: selectedItem.value.stationName || '',
      stationCode: selectedItem.value.stationCode || '',
    }

    emit('select', result)
    popup.value.close()
  } else {
    uni.showToast({
      title: '请选择要分配的服务站',
      icon: 'none',
    })
  }
}

// 处理搜索按钮点击
const handleQuery = () => {
  // 重置为第一页并刷新
  scrollerData.resetPagination()
  scrollerData.updateQueryParams({
    _t: Date.now(),
  })
}

// 添加清空搜索方法
const clearSearch = () => {
  queryParams.value.stationCode = ''
  handleQuery() // 调用搜索方法刷新数据
}

// 打开弹框
const open = (val, opt, kehuXinfoValue) => {
  // 清空选中项
  selectedItem.value = null

  // 重置查询参数
  queryParams.value = {
    stationCode: '',
    stationName: '',
    status: '0',
    projectId: '',
    processId: '',
    province: '',
    city: '',
    county: '',
  }

  // 保存已选服务站ID用于回显
  if (val && val.value) {
    selectedStationId.value = val.value.stationId || ''
  } else if (typeof val === 'string') {
    selectedStationId.value = val
  } else {
    selectedStationId.value = ''
  }

  // 派单范围(0 全部范围| 1指定范围)：dispatchRange
  // 分配方式(1 总部只管| 2区域协调)：distribution
  if (opt && opt.distribution == '1' && opt.dispatchRange == '0') {
    queryParams.value.status = '0'
    stationListApi.value = getStationList
  } else if (opt && opt.distribution == '1' && opt.dispatchRange == '1') {
    queryParams.value.projectId = opt.projectId
    queryParams.value.processId = opt.processId

    if (kehuXinfoValue) {
      queryParams.value.province = kehuXinfoValue.province
      queryParams.value.city = kehuXinfoValue.city
      queryParams.value.county = kehuXinfoValue.county
    }

    stationListApi.value = hqDirectControSpecifyTheScope
  } else {
    // 默认使用getStationList
    stationListApi.value = getStationList
  }
  // 先打开弹窗
  popup.value.open()
  // 重置滚动器状态并请求数据
  scrollerData.reset()
  scrollerData.refresh()
}

// 对外暴露方法
defineExpose({
  open,
})

// 定义事件
const emit = defineEmits(['select'])
</script>

<style lang="scss" scoped>
@import '~@/components/Edit-Dialog/compont/PageListPop/fenYePop.scss';
</style>

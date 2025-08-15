<template>
  <uni-popup ref="popup" type="bottom" @close="handleClose">
    <view class="popup-container">
      <!-- 顶部标题栏 -->
      <view class="popup-header">
        <text class="popup-title">选择工程师</text>
        <text class="popup-close" @tap="handleClose">×</text>
      </view>

      <!-- 搜索栏 -->
      <view class="search-bar">
        <view class="search-input-wrapper">
          <input type="text" v-model="queryParams.userName" placeholder="搜索登录名/用户名" />
          <DsSvgIcon icon="icon-guanbi" class="icon-guanbi" v-if="queryParams.userName" @click="clearSearch" />
          <DsSvgIcon icon="icon-sousuo" class="icon-sousuo" @click="handleQuery" />
        </view>
      </view>

      <!-- 使用WorkorderScroller组件 -->
      <workorder-scroller :dataSource="scrollerData" class="order-scroller" tabId="engineers" :key="renderKey">
        <view v-for="(item, index) in scrollerData.list" :key="item.id || index" class="order-item" :class="{ active: selectRows?.id === item.id }" @tap="clickRow(item)">
          <view class="order-info">
            <view class="order-name">{{ item.nickName || '未知用户' }}</view>
            <view class="order-desc">
              <text>登录名: {{ item.userName || '' }}</text>
            </view>
            <view class="order-desc">
              <text>手机号: {{ item.phonenumber || '' }}</text>
            </view>
          </view>
          <view class="checkboxList" :class="{ selectChecked: selectRows?.id === item.id }">
            <text v-if="selectRows?.id === item.id" class="check-icon">✓</text>
          </view>
        </view>
      </workorder-scroller>

      <!-- 底部按钮 -->
      <view class="popup-footer">
        <button class="btn-cancel" @tap="handleClose">取消</button>
        <button class="btn-confirm" @tap="handleSelectUser">确定</button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import WorkorderScroller from '@/components/workorder-scroller/workorder-scroller.vue'
import { useScroller } from '@/components/workorder-scroller/useScroller'
import { listStationUser } from '@/api/create-newwork-orderpage/createNewWorkOrderPageApi.js'

const props = defineProps({
  excludeId: {
    type: [Number, String],
    default: '',
  },
  projectId: {
    type: [Number, String],
    default: '',
  },
})

const emit = defineEmits(['select'])

// 弹框引用
const popup = ref(null)

// 查询参数
const queryParams = ref({
  userName: '',
  stationId: '',
  status: '0',
  delFlag: '0',
  userType: '2',
})

// 选中的工程师
const selectRows = ref(null)
// 之前选中的ID
const huiXianCheckId = ref('')
// 强制刷新标记
const renderKey = ref(0)

// 使用滚动加载钩子
const scrollerData = useScroller({
  fetchService: (params) => {
    return listStationUser({
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      userName: queryParams.value.userName,
      stationId: queryParams.value.stationId,
      status: queryParams.value.status,
      delFlag: queryParams.value.delFlag,
      userType: queryParams.value.userType,
    }).then((res) => {
      // 恢复选中状态（如果存在）
      if (huiXianCheckId.value && res.rows && res.rows.length > 0) {
        const previouslySelectedRow = res.rows.find((row) => row.id === huiXianCheckId.value)
        if (previouslySelectedRow) {
          selectRows.value = previouslySelectedRow
        }
      }
      return res
    })
  },
  useCache: false,
  cacheKey: () => 'engineers',
  immediate: false,
})

// 点击行选择
function clickRow(row) {
  selectRows.value = row
}

// 处理搜索
function handleQuery() {
  // 重置为第一页并刷新
  scrollerData.resetPagination()
  scrollerData.updateQueryParams({
    _t: Date.now(),
  })
}

// 清空搜索
function clearSearch() {
  queryParams.value.userName = ''
  handleQuery()
}

// 关闭弹窗
function handleClose() {
  popup.value.close()
}

// 选择工程师
function handleSelectUser() {
  console.log('PopupSelector.handleSelectUser called with selectedRow:', selectRows.value)

  if (selectRows.value) {
    // 确保有足够的属性发送给父组件
    const result = {
      ...selectRows.value,
      // 确保这些必要的属性存在
      id: selectRows.value.id || '',
      userName: selectRows.value.userName || '',
      stationId: selectRows.value.stationId || '',
      stationName: selectRows.value.stationName || '',
      stationCode: selectRows.value.stationCode || '',
    }

    emit('select', result)
    handleClose()
  } else {
    uni.showToast({
      title: '请选择工程师',
      icon: 'none',
    })
  }
}

// 打开弹窗
function open(stationId, slectId) {
  console.log('PopupSelector.open called with:', { stationId, slectId })

  // 清空选中项
  selectRows.value = null

  // 设置查询参数
  queryParams.value.stationId = stationId
  queryParams.value.status = '0'
  queryParams.value.delFlag = '0'
  queryParams.value.userType = '2'
  queryParams.value.userName = ''

  // 保存回显ID
  huiXianCheckId.value = slectId

  // 打开弹窗
  popup.value.open()

  // 重置滚动器状态并请求数据
  scrollerData.reset()
  scrollerData.refresh()
}

// 对外暴露方法
defineExpose({
  open,
})
</script>

<style lang="scss" scoped>
@import '~@/components/Edit-Dialog/compont/PageListPop/fenYePop.scss';
</style>

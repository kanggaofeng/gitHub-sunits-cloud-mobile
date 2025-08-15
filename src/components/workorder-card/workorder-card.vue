<!-- src/components/workorder-card/workorder-card.vue -->
<template>
  <view class="workorder-card" @click.stop="handleProcess">
    <view class="workorder-card-header">
      <view class="order-info">
        <view class="workorder-id">{{ workorder?.incidentCode || '无工单号' }}</view>
        <view class="copy-icon" @click.stop="copyOrderNo">
          <DsSvgIcon icon="icon-dizhi" class="icon-fuzhi" />
        </view>
      </view>
      <view class="workorder-status" :class="getStatusClass()">{{ workorderStatus(workorder) }}</view>
    </view>

    <view class="workorder-content">
      <!-- 进度条项 -->
      <view class="workorder-progress-items" v-if="workorder?.kpiList && workorder?.kpiList.length > 0">
        <!-- 使用SlaProgressInfo组件循环渲染KPI列表 -->
        <WorkorderCardSlaProgressInfo v-for="(item, index) in workorder.kpiList" :key="index" :progressItem="item" />
      </view>

      <view class="dotted-line"></view>

      <!-- 预约时间 -->
      <view class="workorder-time-row" v-if="workorder?.appointExpectTime">
        <view class="label">预约时间</view>
        <view class="value">{{ workorder.appointExpectTime }}</view>
      </view>
      <view class="workorder-time-row" v-else>
        <view class="label">未预约客户时间</view>
      </view>

      <!-- 地点和项目 -->
      <view class="workorder-location-item">
        <view class="location-icon">
          <DsSvgIcon icon="icon-dizhi" />
        </view>
        <view class="location-text">{{ workorder?.areaName + '(' + workorder?.visitAddress + ')' || '暂无地址' }}</view>
      </view>
      <view class="workorder-location-item" style="margin-top: 5px">
        <view class="location-icon">
          <DsSvgIcon icon="icon-xiangmu" />
        </view>
        <view class="location-text">{{ workorder?.projectShortname || '未知项目' }}</view>
      </view>
      <!-- 服务需求 -->
      <view class="workorder-description">
        {{ workorder?.serviceRequirements || '暂无服务内容' }}
        <DsSvgIcon icon="icon-xuqiu" />
      </view>
      <view class="service-type">
        <text class="label">服务流程:</text>
        <text class="value">{{ workorder?.processName || '暂无流程' }}</text>
      </view>
      <view class="dotted-line"></view>
      <!-- 服务类型 -->
      <view class="workorder-footer">
        <!-- 操作按钮 -->
        <view class="flag-icon" @click.stop="toggleImportant">
          <uni-icons type="flag-filled" size="20" :color="isImportant ? '#FF3B30' : '#999'"></uni-icons>
          <text class="flag-text">{{ isImportant ? '已关注' : '重点关注' }}</text>
        </view>
        <view class="action-button" :class="{ 'action-button-view': tabIndex === 2 || tabIndex === 4 }" @click.stop="handleProcess">
          {{ tabIndex === 2 || tabIndex === 4 ? '查看' : '处理' }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { attention } from '@/api/workorder'
import WorkorderCardSlaProgressInfo from './WorkorderCardSlaProgressInfo.vue'
const { proxy } = getCurrentInstance()

// 设置状态
let incidentStatusList = proxy.getAllDict('incident_status')
const getStatusByValue = (list, value) => {
  return list.find((item) => item.value === value) || null
}

// 工单卡片组件
const props = defineProps({
  workorder: {
    type: Object,
    required: true,
  },
  tabIndex: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['click', 'process', 'allRefresh'])
const isImportant = ref(props.workorder?.izChecked == 1)
const workorderStatus = (val) => {
  if (val.incidentStatus != 5 && val.incidentStatus != 6) {
    return val.stateName
  } else {
    return getStatusByValue(incidentStatusList, val.incidentStatus).label
  }
}

// 处理按钮点击
const handleProcess = () => {
  if (!props.workorder || !props.workorder.id) return
  uni.navigateTo({
    url: `/pages/workorder-detail/workorder-detail?id=${props.workorder.id}`,
  })
}

// 复制工单号
const copyOrderNo = () => {
  if (!props.workorder?.incidentCode) {
    uni.showToast({
      title: '无工单号可复制',
      icon: 'none',
    })
    return
  }

  uni.setClipboardData({
    data: props.workorder.incidentCode,
    success: () => {
      uni.showToast({
        title: '工单号已复制',
        icon: 'none',
      })
    },
  })
}

// 切换重要标记
const toggleImportant = async () => {
  if (!props.workorder || !props.workorder.id) {
    uni.showToast({
      title: '无法操作，工单数据不完整',
      icon: 'none',
    })
    return
  }

  const newStatus = !isImportant.value
  isImportant.value = newStatus

  try {
    // 调用重点关注API
    await attention({
      incidentId: props.workorder.id,
      checked: newStatus ? 1 : 0,
    })

    uni.showToast({
      title: newStatus ? '已添加关注' : '已取消关注',
      icon: 'none',
    })

    // 只在添加关注时刷新
    if (newStatus) {
      emit('allRefresh')
    }
  } catch (error) {
    console.error('重点关注操作失败:', error)
    // 如果失败，恢复状态
    isImportant.value = !newStatus
  }
}

// 获取状态对应的样式类
const getStatusClass = () => {
  switch (props.tabIndex) {
    case 0:
      return 'status-wait'
    case 1:
      return 'status-processing'
    case 2:
      return 'status-review'
    case 3:
      return 'status-canceled'
    default:
      return 'status-default'
  }
}
</script>

<style lang="scss" scoped>
.workorder-card {
  margin: 10px 15px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  &:last-child {
    margin-bottom: 0;
  }
  &:first-child {
    margin-top: 0;
  }
  .workorder-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #f5f5f5;

    .order-info {
      display: flex;
      align-items: center;

      .workorder-id {
        font-weight: 500;
        font-size: 15px;
        color: #000000;
      }

      .copy-icon {
        margin-left: 5px;
        padding: 3px;
      }
    }

    .workorder-status {
      font-weight: 500;
      font-size: 13px;

      &.status-wait {
        color: #08c183;
      }

      &.status-processing {
        color: #ff7500;
      }

      &.status-review {
        color: #ff7500;
      }

      &.status-canceled {
        color: #83849f;
      }

      &.status-default {
        color: #83849f;
      }
    }
  }

  .workorder-content {
    padding: 12px 15px;
    height: 100%;
    .workorder-progress-items {
      margin-bottom: 12px;
    }

    .dotted-line {
      height: 1px;
      background-image: linear-gradient(to right, #ddd 50%, transparent 50%);
      background-size: 6px 1px;
      background-repeat: repeat-x;
      margin: 12px 0;
    }

    .workorder-time-row {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      font-weight: 500;
      font-size: 14px;
      color: #000000;

      .label {
        margin-right: 10px;
      }
    }

    .workorder-location-item {
      display: flex;
      align-items: center;

      .location-icon {
        margin-right: 5px;
        display: flex;
        align-items: center;
      }

      .location-text {
        flex: 1;
        font-weight: 400;
        font-size: 12px;
        color: #566070;
      }
    }

    .workorder-description {
      margin-top: 10px;
      font-weight: 500;
      font-size: 13px;
      color: #0a1028;
      margin-bottom: 12px;
      background: linear-gradient(270deg, rgba(246, 247, 249, 0.28) 0%, #f6f7f9 100%);
      border-radius: 8px;
      padding: 10px;
      line-height: 20px;
      position: relative;
      .icon-xuqiu {
        font-size: 13px;
        position: absolute;
        right: 8px;
        top: 8px;
        color: #e0e1e5;
      }
    }
    .service-type {
      display: flex;
      align-items: center;
      background-color: #fff8e6;
      padding: 6px 10px;
      border-radius: 4px;

      .label {
        font-size: 12px;
        color: #666;
        margin-right: 5px;
      }

      .value {
        font-size: 12px;
        color: #333;
      }
    }
    .workorder-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .flag-icon {
        margin-right: 15px;
        padding: 5px;
        display: flex;
        align-items: center;
        flex-direction: column;
      }
      .flag-text {
        font-weight: 500;
        font-size: 11px;
        color: #34425e;
        margin-top: 3px;
      }
      .action-button {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #fff;
        background-color: #007aff;
        background: #3870fd;
        border-radius: 6px;
        padding: 8px 40px;
      }
    }
  }
}

.action-button-view {
  background: #fff !important;
  color: #222 !important;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 8px 40px;
  font-size: 14px;
  box-sizing: border-box;
}
.icon-fuzhi {
  color: #b9b9b9;
}
</style>

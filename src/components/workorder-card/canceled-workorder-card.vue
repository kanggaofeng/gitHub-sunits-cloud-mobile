<!-- src/components/workorder-card/canceled-workorder-card.vue -->
<template>
  <view class="canceled-workorder-card">
    <view class="workorder-card-header">
      <view class="order-info">
        <view class="workorder-id">{{ workorder?.incidentCode || '无工单号' }}</view>
        <view class="copy-icon" @click.stop="copyOrderNo">
          <DsSvgIcon icon="icon-dizhi" class="icon-fuzhi" />
        </view>
      </view>
      <view class="workorder-status status-canceled">{{ workorderStatus(workorder) }}</view>
    </view>

    <view class="workorder-content">
      <!-- 地点和项目 -->
      <!-- <view class="workorder-location-item">
        <view class="location-icon">
          <DsSvgIcon icon="icon-dizhi" />
        </view>
        <view class="location-text">{{ workorder?.visitAddress || '暂无地址' }}</view>
      </view> -->
      <view class="workorder-location-item" style="margin-top: 5px">
        <view class="location-icon">
          <DsSvgIcon icon="icon-xiangmu" />
        </view>
        <view class="location-text">{{ workorder?.projectShortname || '未知项目' }}</view>
      </view>
      <!-- 撤单原因 -->
      <view class="cancel-reason">
        <text class="reason-label">撤单原因：</text>
        <text class="reason-text">{{ workorder.cancelReason || '其他原因' }}</text>
      </view>
      <view class="dotted-line"></view>

      <!-- 底部按钮 -->
      <view class="workorder-footer">
        <view></view>
        <view class="action-button" @click.stop="acknowledgeWorkorder">已知晓</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { attention, confirmCancelled } from '@/api/workorder'
const { proxy } = getCurrentInstance()
// 工单卡片组件
const props = defineProps({
  workorder: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['click', 'acknowledge'])
const isImportant = ref(false)

onMounted(() => {
  // 初始化重点关注状态
  isImportant.value = props.workorder?.izChecked == 1
})
let incidentStatusList = proxy.getAllDict('incident_status')
const getStatusByValue = (list, value) => {
  return list.find((item) => item.value === value) || null
}
const workorderStatus = (val) => {
  if (val.incidentStatus != 5 && val.incidentStatus != 6) {
    return val.stateName
  } else {
    return getStatusByValue(incidentStatusList, val.incidentStatus).label
  }
}

// 处理卡片点击
const handleCardClick = () => {
  emit('click', props.workorder)
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
  } catch (error) {
    console.error('重点关注操作失败:', error)
    // 如果失败，恢复状态
    isImportant.value = !newStatus
  }
}

// 已知晓点击处理
const acknowledgeWorkorder = async () => {
  if (!props.workorder || !props.workorder.id) {
    uni.showToast({
      title: '无法操作，工单数据不完整',
      icon: 'none',
    })
    return
  }

  try {
    // 调用已知晓API
    await confirmCancelled(props.workorder.id)

    // 通知父组件更新
    emit('acknowledge', props.workorder)

    // 显示操作成功提示
    uni.showToast({
      title: '已知晓',
      icon: 'success',
    })
  } catch (error) {
    console.error('已知晓操作失败:', error)
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none',
    })
  }
}
</script>

<style lang="scss" scoped>
.canceled-workorder-card {
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

      &.status-canceled {
        color: #999999;
      }
    }
  }

  .workorder-content {
    padding: 15px;

    .cancel-reason {
      margin-top: 10px;
      background-color: #fff6f5;
      border-radius: 4px;
      padding: 10px;
      margin-bottom: 12px;
      background: linear-gradient(270deg, #ffefcf 0%, #ffefcf 100%);
      border-radius: 4px;
      font-weight: 400;
      font-size: 12px;
      color: #f64b28;
      .reason-label {
        margin-right: 5px;
      }
    }

    .workorder-location-row {
      display: flex;
      margin-bottom: 12px;

      .location-icon {
        margin-right: 5px;
      }

      .location-info {
        flex: 1;

        .location-name {
          font-size: 14px;
          color: #333;
          margin-bottom: 4px;
        }

        .project-name {
          font-size: 13px;
          color: #666;
        }
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
      font-size: 14px;
      color: #333;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .service-type {
      font-size: 13px;
      color: #666;
      margin-bottom: 15px;

      .label {
        margin-right: 5px;
      }

      .value {
        color: #333;
      }
    }

    .dotted-line {
      height: 1px;
      border-top: 1px dashed #eee;
      margin: 12px 0;
    }

    .workorder-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .flag-icon {
        display: flex;
        align-items: center;

        .flag-text {
          font-size: 13px;
          color: #666;
          margin-left: 5px;
        }
      }

      .action-button {
        padding: 6px 16px;
        background-color: #2979ff;
        color: #fff;
        font-size: 14px;
        border-radius: 4px;

        &.acknowledged {
          background-color: #8f8f8f;
        }
      }
    }
  }
}

.icon-fuzhi {
  color: #b9b9b9;
}
</style>

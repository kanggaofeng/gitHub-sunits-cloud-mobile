<template>
  <div class="info-wrap" v-if="sheBeiList.length > 0">
    <view class="section-title">
      <view class="biaoTititle">
        设备信息
        <span class="titEnd">DEVICE</span>
      </view>
      <view class="chaKanSheBei">
        查看全部 {{ sheBeiList.length }} 个设备
        <uni-icons type="right" size="14" color="#3870fd"></uni-icons>
      </view>
    </view>

    <view class="info-container">
      <view class="device-item" v-if="equInfoList && equInfoList.id">
        <view class="device-header">
          <text class="device-name">{{ equInfoList.name || '设备名称' }}</text>
          <text class="device-status" v-if="deviceInfo_equModel === '0'">标准单台模式</text>
          <text class="device-status" v-if="deviceInfo_equModel === '1'">批量模式</text>
          <text class="device-status" v-if="deviceInfo_equModel === '2'">设备保修模式</text>
        </view>

        <view class="info-item">
          <view class="itemTitle">序列号：</view>
          <view class="itemVal">{{ equInfoList.equSn || '无' }}</view>
        </view>

        <view class="info-item" v-if="isShowFielVald('设备类型')">
          <view class="itemTitle">设备类型：</view>
          <view class="itemVal">{{ isDevice_input || '--' }}</view>
        </view>

        <view class="info-item" v-if="isShowFielVald('设备型号')">
          <view class="itemTitle">设备型号：</view>
          <view class="itemVal">{{ isShowModel_input || '--' }}</view>
        </view>

        <view class="info-item" v-if="isShowFielVald('设备尺寸')">
          <view class="itemTitle">设备尺寸：</view>
          <view class="itemVal">{{ isShowSize_input || '--' }}</view>
        </view>

        <view class="info-item" v-if="isShowFielVald('服务方式')">
          <view class="itemTitle">服务方式：</view>
          <view class="itemVal">{{ isShowServiceMethod_input || '--' }}</view>
        </view>
      </view>
    </view>
  </div>
</template>

<script setup>
// 设备信息模型
const equInfoList = ref({})
const deviceInfo_equModel = ref('')

// 字段显示控制
const isDevice = ref(false)
const isDevice_input = ref('')
const isShowModel = ref(false)
const isShowModel_input = ref('')
const isShowSize = ref(false)
const isShowSize_input = ref('')
const sheBeiInfoConfigList = ref([])
const isShowServiceMethod = ref(false)
const isShowServiceMethod_input = ref('')
const sheBeiList = ref([])
const isFieldRequired = (fieldName) => {
  const fieldConfig = sheBeiInfoConfigList.value.find((item) => item.name === fieldName)
  return fieldConfig && fieldConfig.requiredFormat === '1'
}
const isShowFielVald = (fieldName) => {
  const fieldConfig = sheBeiInfoConfigList.value.find((item) => item.name === fieldName)
  return fieldConfig && fieldConfig.visibleFormat === '1'
}
// 初始化设备信息
const initDeviceInfo = (cusInfoConfigListParam, val, selectProcessIdOption, kaiDanHuiXianSheBeiInfo) => {
  deviceInfo_equModel.value = selectProcessIdOption.equModel
  sheBeiList.value = kaiDanHuiXianSheBeiInfo

  equInfoList.value = {}

  // 设置设备信息
  if (kaiDanHuiXianSheBeiInfo && kaiDanHuiXianSheBeiInfo.length > 0) {
    equInfoList.value = kaiDanHuiXianSheBeiInfo[0]
    sheBeiInfoConfigList.value = cusInfoConfigListParam || []
    // 处理设备字段值
    if (equInfoList.value?.equFieldValueList) {
      equInfoList.value.equFieldValueList.forEach((field) => {
        if (field.fieldName === '设备类型') {
          isDevice_input.value = field.fieldValue
        }
        if (field.fieldName === '设备尺寸') {
          isShowSize_input.value = field.fieldValue
        }
        if (field.fieldName === '设备型号') {
          isShowModel_input.value = field.fieldValue
        }
        if (field.fieldName === '服务方式') {
          isShowServiceMethod_input.value = field.fieldValue
        }
      })
    }
  }
}

// 暴露方法给父组件
defineExpose({
  initDeviceInfo,
})
</script>

<style lang="scss" scoped>
@import '@/static/scss/detailInfo.scss';
.chaKanSheBei {
  color: #3870fd;
  font-weight: 500;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-wrapper {
  display: flex;
  align-items: center;
  background: #ebf1ff;
  border-radius: 12px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  padding: 0 5px;
  padding-right: 10px;

  .hide-btn {
    background: #f5f6f7;
    color: #666;
    border-radius: 12px;
    font-size: 16px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    height: 100%;
  }

  .action-icon {
    color: #3870fd;
    font-size: 16px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    height: 100%;
  }

  .btn-text {
    font-size: 12px;
    margin-left: 3px;
    font-weight: 500;
    font-size: 12px;
  }
}

.empty-device {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;

  .empty-text {
    color: #86909c;
    font-size: 14px;
  }
}

// 设备特有样式
.device-item {
  background-color: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  .device-name {
    font-size: 15px;
    font-weight: 500;
    color: #1d2129;
  }

  .device-status {
    font-size: 13px;
    color: #2160fd;
    background: rgba(33, 96, 253, 0.1);
    padding: 2px 8px;
    border-radius: 10px;
  }
}
</style>

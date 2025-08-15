<template>
  <div class="service-information">
    <!-- 基础信息 -->
    <div class="info-wrap" style="margin-top: 10px">
      <view class="section-title">
        <view class="biaoTititle">
          基本信息
          <span class="titEnd">BASIC</span>
        </view>
      </view>
      <view class="info-container">
        <view class="info-item">
          <view class="itemTitle">工单号：</view>
          <view class="itemVal">
            {{ basicInfo.incidentCode }}
            <DsSvgIcon icon="icon-fuzhi1" color="#3870fd" @click="handleCopy(basicInfo.incidentCode)" />
          </view>
        </view>

        <!-- 附属工单号 -->
        <view class="info-item" v-if="basicInfo.thirdPartyCode">
          <view class="itemTitle">附属工单号：</view>
          <view class="itemVal">
            {{ basicInfo.thirdPartyCode }}
            <DsSvgIcon icon="icon-fuzhi1" color="#3870fd" @click="handleCopy(basicInfo.thirdPartyCode)" />
          </view>
        </view>

        <!-- 工单状态概览 -->
        <view class="info-item status-overview">
          <view class="status-title">工单状态概览</view>
          <view class="status-tags">
            <view class="status-tag">
              <text>工单状态</text>
              <text class="tag success">{{ incidentStatus ? incidentStatus.label : basicInfo.handleStatus }}</text>
            </view>
            <view class="status-tag">
              <text>预约状态</text>
              <text class="tag warning">{{ appointmentStatus ? appointmentStatus.label : '' }}</text>
            </view>
            <view class="status-tag">
              <text>备件状态</text>
              <text class="tag danger">{{ partsStatus ? partsStatus.label : '' }}</text>
            </view>
          </view>
        </view>

        <view class="info-item">
          <view class="itemTitle">项目名称：</view>
          <view class="itemVal">{{ getNameDisplay(basicInfo.projectShortname, basicInfo.projectCode) }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">服务流程：</view>
          <view class="itemVal">{{ basicInfo.processName || '--' }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">派单模式：</view>
          <view class="itemVal">{{ dispatchMode ? dispatchMode.label : basicInfo.remark }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">工单创建时间：</view>
          <view class="itemVal">{{ formatDate(basicInfo.createTime) }}</view>
        </view>
      </view>
    </div>

    <!-- 工单相关人员信息 -->
    <div class="info-wrap">
      <view class="section-title">
        <view class="biaoTititle">
          工单相关人员信息
          <span class="titEnd">PERSONNEL</span>
        </view>
      </view>
      <view class="info-container">
        <view class="info-item">
          <view class="itemTitle">当前处理人：</view>
          <view class="itemVal">{{ getNameDisplay(basicInfo.currentPersonName, basicInfo.currentPersonCode, basicInfo.currentPersonMobile) }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">创建人：</view>
          <view class="itemVal">{{ getNameDisplay(basicInfo.createByName, basicInfo.createByCode, basicInfo.createdByMobile) }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">区域负责人：</view>
          <view class="itemVal">{{ getNameDisplay(basicInfo.regionLeaderName, basicInfo.regionLeaderCode, basicInfo.regionLeaderMobile) }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">服务网点：</view>
          <view class="itemVal">{{ getNameDisplay(basicInfo.stationName, basicInfo.stationCode) }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">工程师：</view>
          <view class="itemVal">{{ basicInfo.engineerName  || '--'}}</view>
        </view>
      </view>
    </div>
  </div>
</template>

<script setup>
import useWorkOrderStore from '@/store/modules/workOrder'

const { proxy } = getCurrentInstance()
const workOrderStore = useWorkOrderStore()
const basicInfo = computed(() => workOrderStore.basicInfo)

// 复制功能
const handleCopy = (text) => {
  if (!text) return
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({
        title: '复制成功',
        icon: 'success',
        duration: 2000,
      })
    },
    fail: () => {
      uni.showToast({
        title: '复制失败',
        icon: 'error',
        duration: 2000,
      })
    },
  })
}

// 处理状态信息
const incidentStatus = computed(() => {
  if (!basicInfo.value || !basicInfo.value.incidentStatus) return null

  const incidentStatusList = proxy?.getAllDict('incident_status') || []
  return basicInfo.value.incidentStatus != '5' && basicInfo.value.incidentStatus != '6'
    ? { label: basicInfo.value.handleStatus }
    : getStatusByValue(incidentStatusList, basicInfo.value.incidentStatus)
})

const appointmentStatus = computed(() => {
  if (!basicInfo.value || !basicInfo.value.appointmentStatus) return null

  const appointmentStatusList = proxy?.getAllDict('appointment_status') || []
  return getStatusByValue(appointmentStatusList, basicInfo.value.appointmentStatus)
})

const partsStatus = computed(() => {
  if (!basicInfo.value || !basicInfo.value.partsStatus) return null

  const partsStatusList = proxy?.getAllDict('part_status') || []
  return getStatusByValue(partsStatusList, basicInfo.value.partsStatus)
})

const dispatchMode = computed(() => {
  if (!basicInfo.value || !basicInfo.value.dispatchMode) return null

  const dispenseMethodList = proxy?.getAllDict('dispense_method') || []
  return getStatusByValue(dispenseMethodList, basicInfo.value.dispatchMode)
})

// 根据值获取状态对象
const getStatusByValue = (list, value) => {
  return list.find((item) => item.value === value) || null
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}年${month}月${day}日 ${hours}:${minutes}`
}

// 获取名称显示
const getNameDisplay = (shortname, code, code2) => {
  if (!shortname) return '--'
  const codePart = code ? `(${code}` : ''
  const code2Part = code2 ? `、${code2})` : codePart ? ')' : ''
  return `${shortname}${codePart}${code2Part}`
}

// 暴露方法给父组件调用
defineExpose({})
</script>

<style lang="scss" scoped>
@import '@/static/scss/detailInfo.scss';

.highlight {
  color: #ff4d4f;
}

.action-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #3870fd;
  color: #fff;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
}

.status-overview {
  flex-direction: column;
  align-items: normal !important;
  padding: 10px 15px;
  margin: 10px 0;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.status-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}

.status-tags {
  display: flex;
  flex-direction: column;
}

.status-tag {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.success {
  background-color: #67c23a;
}

.warning {
  background-color: #e6a23c;
}

.danger {
  background-color: #f56c6c;
}

.section-subtitle {
  font-size: 15px;
  font-weight: 600;
  padding: 10px 15px;
  color: #333;
  border-bottom: 1px solid #eee;
  margin: 10px 0;
}
</style>

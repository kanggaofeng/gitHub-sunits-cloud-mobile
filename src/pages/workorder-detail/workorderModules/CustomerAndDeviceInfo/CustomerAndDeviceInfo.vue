<template>
  <div class="customer-and-device-info">
    <div class="info-wrap">
      <view class="section-title">
        <view class="biaoTititle">
          客户信息
          <span class="titEnd">CUSTOMER</span>
        </view>
        <view class="action-wrapper">
          <view :class="['action-btn', isHidden ? 'hide-btn' : 'action-icon']" @click="toggleHide">
            <uni-icons :type="isHidden ? 'eye' : 'eye-slash'" size="16" :style="{ color: isHidden ? '#3870FD' : '#86909C' }"></uni-icons>
            <text class="btn-text" :style="{ color: isHidden ? '#3870FD' : '#86909C' }">{{ isHidden ? '显示信息' : '隐藏信息' }}</text>
          </view>
        </view>
      </view>

      <view class="info-container">
        <view class="info-item">
          <view class="itemTitle">客户姓名：</view>
          <view class="itemVal">{{ isHidden ? '**' : customer.cusName || '--' }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">客户电话：</view>
          <view class="itemVal">{{ isHidden ? '***' : customer.cusMobile || '--' }}</view>
        </view>

        <view class="info-item" v-if="isShowOrganization">
          <view class="itemTitle">所属组织：</view>
          <view class="itemVal">{{ isHidden ? '***' : customer.organization || '--' }}</view>
        </view>

        <view class="info-item" v-if="isShowGrade">
          <view class="itemTitle">客户等级：</view>
          <view class="itemVal">{{ isHidden ? '***' : customer.grade || '--' }}</view>
        </view>

        <view class="info-item" v-if="isShowType">
          <view class="itemTitle">客户类型：</view>
          <view class="itemVal">{{ isHidden ? '***' : customer.type || '--' }}</view>
        </view>

        <view class="info-item" v-if="isShowStoresName">
          <view class="itemTitle">门店名称：</view>
          <view class="itemVal">{{ isHidden ? '***' : customer.storeName || '--' }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">省市县：</view>
          <view class="itemVal">{{ isHidden ? '***' : customer.areaName || '--' }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">详细地址：</view>
          <view class="itemVal">{{ isHidden ? '***' : customer.visitAddress || '--' }}</view>
        </view>

        <view class="listBtn">
          <div class="dangHang" @click="navigate">
            <DsSvgIcon icon="icon-dizhi" fontSize="16px" color="#3870fd"></DsSvgIcon>
            <text class="listBtnText">位置导航</text>
          </div>
          <div class="lianXi" @click="callPhone">
            <DsSvgIcon icon="icon-dianhua" fontSize="16px" color="#3870fd"></DsSvgIcon>
            <text class="listBtnText">联系客户</text>
          </div>
        </view>
      </view>
    </div>
    <!-- 设备信息 标准单台模式  -->
    <NormalMode ref="normalModeRef" v-if="customer.deviceModel === '0'"></NormalMode>
    <!-- 设备信息 设备保修模式 -->
    <FixMode ref="fixModeRef" v-if="customer.deviceModel === '2'"></FixMode>
  </div>
</template>

<script setup>
import { getWorkorderCustomerAndDevice, listProInfoConfigByProId } from '@/api/workOrder/workorderCustomerAndDevice.js'
import useWorkOrderStore from '@/store/modules/workOrder'
import FixMode from './components/FixMode.vue'
import NormalMode from './components/NormalMode.vue'

const { proxy } = getCurrentInstance()

const isHidden = ref(true)
const customer = ref({})
const isShowOrganization = ref(false)
const isShowGrade = ref(false)
const isShowType = ref(false)
const isShowStoresName = ref(false)
const listProInfoConfigData = ref(null)

// 获取客户信息
const getCustomerAndDeviceInfo = async () => {
  let incId = useWorkOrderStore().basicInfo.id
  try {
    const customerResponse = await getWorkorderCustomerAndDevice(incId)
    // 解析客户数据
    customer.value = customerResponse.data
    if (customerResponse.data.cusInfoFieldValueList?.length > 0) {
      let fileList = customerResponse.data.cusInfoFieldValueList
      fileList.forEach((item) => {
        switch (item.fieldName) {
          case '客户等级': {
            customer.value.grade = item.fieldValue || '--'
            break
          }
          case '客户所属组织': {
            customer.value.organization = item.fieldValue || '--'
            break
          }
          case '客户类型': {
            customer.value.type = item.fieldValue || '--'
            break
          }
          case '门店名称': {
            customer.value.storeName = item.fieldValue || '--'
            break
          }
        }
      })
    }
    listProInfoConfigByProIdFn(customerResponse.data.incEquRelationList)
  } catch (error) {
    console.error('初始化数据失败', error)
    uni.showToast({
      title: '获取客户信息失败',
      icon: 'none',
    })
  }
}

const isLoadingDeviceConfig = ref(false)
function listProInfoConfigByProIdFn(kaiDanHuiXianSheBeiInfo) {
  useWorkOrderStore().workOrderDetailConfig.cusInfoConfigList.forEach((item) => {
    if (item.name === '客户等级' && item.visibleFormat === '1') {
      isShowGrade.value = true
    }
    if (item.name === '客户所属组织' && item.visibleFormat === '1') {
      isShowOrganization.value = true
    }
    if (item.name === '客户类型' && item.visibleFormat === '1') {
      isShowType.value = true
    }
    if (item.name === '门店名称' && item.visibleFormat === '1') {
      isShowStoresName.value = true
    }
  })
  nextTick(() => {
    // 根据当前模式选择正确的引用
    let componentRef
    switch (customer.value.deviceModel) {
      case '0':
        componentRef = proxy.$refs.normalModeRef
        break
      case '1':
        componentRef = proxy.$refs.batchStrategyRef
        break
      case '2':
        componentRef = proxy.$refs.fixModeRef
        break
    }

    if (componentRef) {
      componentRef.initDeviceInfo(
        useWorkOrderStore().workOrderDetailConfig.equInfoConfigList,
        useWorkOrderStore().basicInfo,
        { equModel: customer.value.deviceModel, cusName: customer.value.cusName, cusMobile: customer.value.cusMobile },
        kaiDanHuiXianSheBeiInfo,
      )
    }
  })
}

function convertNumbersToStrings(obj) {
  if (typeof obj === 'number') {
    return obj.toString()
  } else if (Array.isArray(obj)) {
    return obj.map(convertNumbersToStrings)
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj[key] = convertNumbersToStrings(obj[key])
      }
    }
    return newObj
  }
  return obj
}

// 切换隐藏/显示信息
const toggleHide = () => {
  isHidden.value = !isHidden.value
}

// 拨打电话
const callPhone = () => {
  if (!customer.value.cusMobile || isHidden.value) {
    uni.showToast({
      title: '请先显示信息',
      icon: 'none',
    })
    return
  }

  uni.makePhoneCall({
    phoneNumber: customer.value.cusMobile,
    fail: () => {
      uni.showToast({
        title: '拨打电话失败',
        icon: 'none',
      })
    },
  })
}

// 导航到客户地址
const navigate = () => {
  if (!customer.value.visitAddress || isHidden.value) {
    uni.showToast({
      title: '请先显示信息',
      icon: 'none',
    })
    return
  }

  uni.showToast({
    title: '正在打开导航...',
    icon: 'none',
  })
}

// 暴露方法给父组件调用
defineExpose({
  getCustomerAndDeviceInfo,
})
</script>

<style lang="scss" scoped>
@import '@/static/scss/detailInfo.scss';
// 客户信息特有样式
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

.listBtn {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
  border-top: 1px solid #e5e6eb;
  padding-top: 15px;
  .dangHang,
  .lianXi {
    height: 34px;
    background: #ffffff;
    border-radius: 17px;
    border: 1px solid #3870fd;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 400;
    font-size: 13px;
    color: #3870fd;
    padding: 0 10px;
  }
  .listBtnText {
    margin-left: 5px;
  }
}
</style>

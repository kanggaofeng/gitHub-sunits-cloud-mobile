<template>
  <view class="workorder-detail-container">
    <CustomNavBar title="工单详情" :back="true" backgroundColor="#2160fd"></CustomNavBar>
    <!-- 预约信息头部组件 -->
    <AppointmentHeader ref="AppointmentHeaderRef" @refresh="workorderDetailInit" />
    <!-- SLA 和 完工时效 -->
    <WorkorderDetaiSlaInfo ref="workorderDetaiSlaInfoRef" />
    <!-- 基本信息 -->
    <ServiceInformation ref="ServiceInformationRef" />
    <!-- 客户信息和设备信息 -->
    <CustomerAndDeviceInfo ref="CustomerAndDeviceInfoRef" />
    <!-- 其他功能 -->
    <OtherFunction ref="otherFunctionRef" v-if="basicInfo" />
    <!-- 底部按钮 -->
    <BottomButton ref="bottomButtonRef" @nextNode="nextNode" />
    <!-- 节点信息 -->
    <NodeInfo ref="NodeInfoRef" @refresh="workorderDetailInit" @nextNodeLoding="nextNodeLoding" />
  </view>
</template>

<script setup>
import AppointmentHeader from '@/pages/workorder-detail/workorderModules/AppointmentHeader/AppointmentHeader.vue'
import WorkorderDetaiSlaInfo from '@/pages/workorder-detail/workorderModules/SlaProgressInfo/workorderDetaiSlaInfo.vue'
import BasicInfo from '@/pages/workorder-detail/workorderModules/BasicInfo/BasicInfo.vue'
import ServiceInformation from '@/pages/workorder-detail/workorderModules/ServiceInformation/ServiceInformation.vue'
import CustomerAndDeviceInfo from '@/pages/workorder-detail/workorderModules/CustomerAndDeviceInfo/CustomerAndDeviceInfo.vue'
import OtherFunction from '@/pages/workorder-detail/workorderModules/OtherFunction/OtherFunction.vue'
import BottomButton from '@/pages/workorder-detail/workorderModules/BottomButton/workerBottomButton.vue'
import NodeInfo from '@/pages/workorder-detail/workorderModules/NodeInfo/NodeInfo.vue'

import { workOrderBaseInfo } from '@/api/workOrder/workOrderProcessing.js'
import useWorkOrderStore from '@/store/modules/workOrder'
import { listProInfoConfigByProId } from '@/api/workOrder/workorderCustomerAndDevice.js'

const { proxy } = getCurrentInstance()
const workorderId = ref('')
const workOrderStore = useWorkOrderStore()

// 处理基本信息
const processedBasicInfo = (item) => {
  const result = {}
  for (const [key, value] of Object.entries(item)) {
    result[key] = value === null ? '' : value
  }
  return result
}

const basicInfo = ref(null)
// 初始化页面数据
const initPageData = () => {
  workOrderBaseInfo(workorderId.value).then((res) => {
    workOrderStore.isWorkerDetailRefresh = false
    const processedInfo = processedBasicInfo(res.data)
    basicInfo.value = processedInfo
    workOrderStore.setBasicInfo(processedInfo)
    listProInfoConfigByProId({ projectId: processedInfo.projectId }).then((res) => {
      workOrderStore.workOrderDetailConfig = res.data
      // 获取各组件数据
      proxy.$refs['AppointmentHeaderRef'].init(workorderId.value)
      proxy.$refs['workorderDetaiSlaInfoRef'].getSlaAssessmentProgressFn(workorderId.value)
      proxy.$refs['ServiceInformationRef'].getServiceInformation(workorderId.value)
      proxy.$refs['CustomerAndDeviceInfoRef'].getCustomerAndDeviceInfo(workorderId.value)
      proxy.$refs['NodeInfoRef'].getCustomFormFn(processedInfo.id, processedInfo.currentActivityId, processedInfo)
      proxy.$refs['bottomButtonRef'].init()
    })
  })
}

// 下一步节点加载中
const nextNodeLoding = (val) => {
  proxy.$refs['bottomButtonRef'].setLoadingState(val)
}

// 页面加载时初始化
onLoad((options) => {
  workorderId.value = options.id
  initPageData()
})

// 页面显示时检查是否需要刷新
onShow(() => {
  if (workOrderStore.isWorkerDetailRefresh) {
    initPageData()
  }
})

// 工单详情初始化
const workorderDetailInit = () => {
  initPageData()
}

// 下一步节点操作
const nextNode = (value) => {
  proxy.$refs['NodeInfoRef'].changeData()
}
</script>

<style lang="scss" scoped>
.workorder-detail-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 180px; // 调整底部间距
}
</style>

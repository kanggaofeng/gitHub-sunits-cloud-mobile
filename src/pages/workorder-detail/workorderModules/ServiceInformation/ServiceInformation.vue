<template>
  <div class="service-information" style="margin-top: 10px">
    <!-- 基础信息 -->
    <div class="info-wrap">
      <view class="section-title">
        <view class="biaoTititle">
          {{ getNameDisplay(basicInfo.projectShortname, basicInfo.projectCode) }}
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
        <view class="info-item">
          <view class="itemTitle">服务类型：</view>
          <view class="itemVal">{{ serviceInfo.serviceType || '--' }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">服务流程：</view>
          <view class="itemVal">{{ serviceInfo.processName || '--' }}</view>
        </view>

        <view class="info-item" v-if="isPriority">
          <view class="itemTitle">优先级：</view>
          <view class="itemVal">{{ serviceInfo.priority || '--' }}</view>
        </view>

        <view class="info-item" v-if="isResponsiveLevel">
          <view class="itemTitle">响应级别：</view>
          <view class="itemVal">{{ serviceInfo.responsiveLevel || '--' }}</view>
        </view>

        <view class="info-item" v-if="isServiceCategory">
          <view class="itemTitle">服务类别：</view>
          <view class="itemVal">{{ serviceInfo.serviceCategory || '--' }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">服务需求：</view>
          <view class="itemVal">{{ serviceInfo.serviceRequirements || '--' }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">故障分类：</view>
          <view class="itemVal">{{ serviceInfo.faultClassification || '--' }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">期望服务时间：</view>
          <view class="itemVal">{{ serviceInfo.expectVisitTime || '--' }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">服务方案：</view>
          <view class="itemVal">{{ serviceInfo.solution || '--' }}</view>
        </view>

        <view class="info-item" v-if="serviceInfo.suggestSolution">
          <view class="itemTitle">建议解决方案：</view>
          <view class="itemVal">{{ serviceInfo.suggestSolution || '--' }}</view>
        </view>

        <view class="info-item">
          <view class="itemTitle">备注：</view>
          <view class="itemVal">{{ serviceInfo.remark || '--' }}</view>
        </view>
        <view class="info-item">
          <view class="itemTitle">工单创建时间：</view>
          <view class="itemVal">{{ formatDate(basicInfo.createTime) }}</view>
        </view>
      </view>
    </div>
    <!-- 自定义信息 -->
    <div class="info-wrap" v-if="customFieldList.length > 0">
      <view class="section-title">
        <view class="biaoTititle">
          自定义信息
          <span class="titEnd">CUSTOM</span>
        </view>
      </view>
      <view class="info-container" v-if="customFieldList.length > 0">
        <view class="info-item" v-for="(item, index) in customFieldList" :key="index">
          <view class="itemTitle">{{ item.fieldName }}：</view>
          <view class="itemVal">{{ item.fieldValue || '--' }}</view>
        </view>
      </view>
    </div>
  </div>
</template>

<script setup>
import { getServiceInfo } from '@/api/workOrder/serviceInfo.js'
import useWorkOrderStore from '@/store/modules/workOrder.js'

const { proxy } = getCurrentInstance()
const workOrderStore = useWorkOrderStore()
const basicInfo = computed(() => workOrderStore.basicInfo)

const customFieldList = ref([])

const serviceInfo = reactive({
  serviceType: '',
  processName: '',
  priority: '',
  responsiveLevel: '',
  serviceCategory: '',
  serviceRequirements: '',
  faultClassification: '',
  expectVisitTime: '',
  solution: '',
  suggestSolution: '',
  remark: '',
})

const isServiceCategory = ref(false)
const isPriority = ref(false)
const isResponsiveLevel = ref(false)

// 根据工单ID获取服务信息
const getServiceInformation = async (id) => {
  // 获取服务信息
  await getServiceInfo(id).then((res) => {
    if (res.code === 200) {
      const data = res.data
      const serviceInfoList = data.serviceInfoList

      // 自定义字段列表
      customFieldList.value = data.customFieldList

      // 固定字段赋值
      serviceInfo.expectVisitTime = data.expectVisitTime ? data.expectVisitTime : '--'
      serviceInfo.processName = data.processName ? data.processName : '--'
      serviceInfo.solution = data.solution ? data.solution : '--'
      serviceInfo.serviceRequirements = data.serviceRequirements ? data.serviceRequirements : '--'
      serviceInfo.remark = data.remark ? data.remark : '--'

      // 动态字段赋值
      serviceInfoList.forEach((item) => {
        if (item.fieldName === '服务类型') {
          serviceInfo.serviceType = item.fieldValue
        }
        if (item.fieldName === '服务类别') {
          serviceInfo.serviceCategory = item.fieldValue
        }
        if (item.fieldName === '故障分类') {
          serviceInfo.faultClassification = item.fieldValue
        }
        if (item.fieldName === '优先级') {
          serviceInfo.priority = item.fieldValue
        }
        if (item.fieldName === '建议解决方案') {
          serviceInfo.suggestSolution = item.fieldValue
        }
        if (item.fieldName === '响应级别') {
          serviceInfo.responsiveLevel = item.fieldValue
        }
      })
      isPriority.value = useWorkOrderStore().workOrderDetailConfig.serviceInfoConfigList.some((item) => item.name === '优先级' && item.visibleFormat === '1')
      isResponsiveLevel.value = useWorkOrderStore().workOrderDetailConfig.serviceInfoConfigList.some((item) => item.name === '响应级别' && item.visibleFormat === '1')
      isServiceCategory.value = useWorkOrderStore().workOrderDetailConfig.serviceInfoConfigList.some((item) => item.name === '服务类别' && item.visibleFormat === '1')
    }
  })
}

// 获取名称显示
const getNameDisplay = (shortname, code, code2) => {
  if (!shortname) return '--'
  const codePart = code ? `(${code}` : ''
  const code2Part = code2 ? `、${code2})` : codePart ? ')' : ''
  return `${shortname}${codePart}${code2Part}`
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

// 暴露方法给父组件调用
defineExpose({
  getServiceInformation,
})
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
</style>

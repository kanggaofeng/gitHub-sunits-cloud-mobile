<template>
  <view class="sla-view" v-if="slaList.length > 0">
    <view class="sla-container" v-for="(progressItem, index) in slaList" :key="progressItem.id">
      <DetailSlaProgressInfoCon :progressItem="progressItem" :isLast="index === slaList.length - 1"></DetailSlaProgressInfoCon>
    </view>
  </view>
</template>

<script setup>
import DetailSlaProgressInfoCon from '@/pages/workorder-detail/workorderModules/SlaProgressInfo/DetailSlaProgressInfoCon.vue'
import { getSlaAssessmentProgress } from '@/api/workOrder/workOrderProcessing'

const slaList = ref([])

// 获取SLA评估进度数据
const getSlaAssessmentProgressFn = async (incidentId) => {
  await getSlaAssessmentProgress({
    pageSize: 9999,
    incId: incidentId,
  }).then((res) => {
    if (res.code == 200) {
      slaList.value = res.rows
    }
  })
}


// 暴露方法给父组件调用
defineExpose({
  getSlaAssessmentProgressFn,
})
</script>

<style lang="scss" scoped>
.sla-view {
  padding: 14px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.sla-container {
  background: #fff;
  border-radius: 8px;
}
</style>

<!-- components/PopupContent.vue -->
<template>
  <uni-popup ref="popup" type="bottom" border-radius="10px 10px 0 0" :mask-click="true" z-index="9999">
    <view class="popup-container">
      <view class="popup-header">
        <text class="popup-title">预约记录</text>
        <text class="popup-close" @tap="handleClose">×</text>
      </view>
      <view class="steps-content">
        <DsTimeline
          v-if="records && records.length > 0"
          :items="records"
          :showEndLine="true"
          :lineStyle="{
            margin: '5px 0',
            width: '1px',
            flex: '1',
            backgroundImage: 'repeating-linear-gradient( to bottom,#3a7afe,#3a7afe 1px,transparent 5rpx,transparent 10rpx)',
          }"
        >
          <template #time="{ item }">
            <view class="timeline-item-time">
              <view class="timeline-item-time-line">{{ item.time }}&nbsp;&nbsp; {{ item.name }}</view>
            </view>
          </template>
          <template #content="{ item }">
            <view class="cardContainer">
              <view class="rowItem" v-for="(row, rowIndex) in item.details" :key="rowIndex">
                <text class="rowItemLabel">{{ row.label }}：</text>
                <text class="rowItemValue">{{ row.value }}</text>
              </view>
            </view>
          </template>
        </DsTimeline>
        <view v-else class="no-data">暂无数据</view>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import DsTimeline from '@/components/ds-time-line/DsTimeLine.vue'
import { getAppointList } from '@/api/workOrder/nodeInfo'
const { proxy } = getCurrentInstance()

const props = defineProps({
  records: {
    type: Array,
    default: () => [],
  },
})

const popup = ref(null)
const recordsList = ref([])
const lastAppointExpectTime = ref('')
const workorderId = ref('')

// 打开弹框
const open = () => {
  popup.value.open()
}

// 关闭弹框
const handleClose = () => {
  popup.value.close()
}

onLoad((options) => {
  workorderId.value = options.id
})

// 获取预约记录列表
const getAppointListFn = async (incidentId) => {
  //每次加载清空旧数据
  recordsList.value = []
  let statusList = proxy.getAllDict('appointment_status')
  let statusListMap = new Map(statusList.map((item) => [item.value, item.label]))

  let rescheduleReason = proxy.getAllDict('reschedule_reason')
  let rescheduleReasonMap = new Map(rescheduleReason.map((item) => [item.value, item.label]))

  let unappointReason = proxy.getAllDict('unappoint_reason') // 未预约原因
  let unappointReasonMap = new Map(unappointReason.map((item) => [item.value, item.label]))

  let appointFailReason = proxy.getAllDict('appoint_fail_reason') // 联系失败原因
  let appointFailReasonMap = new Map(appointFailReason.map((item) => [item.value, item.label]))

  await getAppointList(incidentId).then((res) => {
    if (res.code == 200 && res.rows.length > 0) {
      res.rows.forEach((item) => {
        let recordItme = {}

        // 预约
        if (item.type == 0) {
          recordItme = {
            name: item.updateName,
            type: item.type,
            details: [],
            time: '暂无',
          }
          if (item.appointStatus == 1) {
            //已联系已预约
            recordItme.time = item.createTime
            recordItme.details = [
              { label: '预约状态', value: statusListMap.get(item.appointStatus) },
              { label: '预约时间', value: item.appointExpectTime },
              { label: '备注', value: item.appointDesc },
            ]
          } else if (item.appointStatus == 2) {
            //已联系未预约
            recordItme.details = [
              { label: '预约状态', value: statusListMap.get(item.appointStatus) },
              { label: '原因', value: unappointReasonMap.get(item.reasonDict) },
              { label: '备注', value: item.appointDesc },
            ]
          } else if (item.appointStatus == 3) {
            //预约失败
            recordItme.details = [
              { label: '预约状态', value: statusListMap.get(item.appointStatus) },
              { label: '原因', value: appointFailReasonMap.get(item.reasonDict) },
              { label: '备注', value: item.appointDesc },
            ]
          }
        } else {
          // 改约
          if (item.reasonDict == -1) {
            recordItme = {
              time: item.createTime,
              name: item.createName,
              type: item.type,
              details: [
                { label: '改约原因', value: rescheduleReasonMap.get(item.reasonDict) },
                { label: '备注', value: item.appointDesc },
              ],
            }
          } else {
            recordItme = {
              time: item.createTime,
              name: item.createName,
              type: item.type,
              details: [
                { label: '改约原因', value: rescheduleReasonMap.get(item.reasonDict) },
                { label: '改约时间', value: item.appointExpectTime },
                { label: '备注', value: item.appointDesc },
              ],
            }
          }
        }
        recordsList.value.push(recordItme)
      })
      if (recordsList.value.length > 0) {
        lastAppointExpectTime.value = recordsList.value[0].time
      }
    }
  })

  return {
    records: recordsList.value,
    lastAppointTime: lastAppointExpectTime.value,
  }
}

// 暴露方法给父组件调用
defineExpose({
  getAppointListFn,
  open,
})
</script>

<style lang="scss" scoped>
@import '~@/components/Edit-Dialog/compont/PageListPop/fenYePop.scss';
.popup-container {
  background: #edf1f8;
}
.steps-content {
  padding: 15px;
  flex-grow: 1;
  overflow-y: auto;
  .cardContainer {
    background: #ffffff;
    border-radius: 10px;
    padding: 20rpx;
    font-size: 26rpx;
    color: #333;
    position: relative;
    margin-bottom: 10px;
    .rowItem {
      margin-bottom: 12rpx;
      .rowItemLabel {
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        font-size: 12px;
        color: #3d3d3d;
        line-height: 24px;
        text-align: left;
        font-style: normal;
      }
    }
  }
  .no-data {
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 600;
    font-size: 18px;
    color: #323232;
    line-height: 50px;
    font-style: normal;
    text-align: center;
    background-color: #fff;
    border-radius: 10px;
  }
}

.timeline-item-time-line {
  display: flex;
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 500;
  font-size: 13px;
  color: #515151;
  line-height: 15px;
  text-align: left;
  font-style: normal;
  gap: 10px;
  margin-bottom: 10px;
}
</style>

<template>
  <view :style="fixedStyle" class="fixed-content" v-if="lastAppointExpectTime">
    <!-- 预约信息头部 -->
    <view class="row between recontracting-view">
      <text class="recontracting-text">
        <span v-if="lastAppointExpectTime">预约时间：{{ lastAppointExpectTime }}</span>
      </text>
      <view class="btn-group">
        <button class="recontracting-btn" v-if="workOrderStore.izShowChangeContractBtn" @click="openRecontractingPopup">改约</button>
        <button class="recontracting-btn" v-if="workOrderStore.izShowAppointFloatingWin" @click="openAppointmentRecordsPopup">预约记录</button>
      </view>
    </view>
  </view>
  <!--改约弹窗-->
  <Recontracting ref="recontractingRef" :workorder="basicInfo" @refresh="refresh" />
  <!--预约弹窗-->
  <AppointmentRecordsPopup ref="appointmentRecordsRef" :records="records" />
</template>

<script setup>
import AppointmentRecordsPopup from './appointment-records-popup.vue'
import Recontracting from './recontracting.vue'
import { getAppointList } from '@/api/workOrder/nodeInfo'
import useWorkOrderStore from '@/store/modules/workOrder'

const workOrderStore = useWorkOrderStore()
const basicInfo = computed(() => workOrderStore.basicInfo)
const { proxy } = getCurrentInstance()
const emit = defineEmits(['refresh'])

const statusBarHeight = ref(0)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
})
const fixedStyle = computed(() => ({
  position: 'sticky',
  top: `${statusBarHeight.value + 44}px`, // 原来的 top: 44px
  left: '0',
  right: '0',
  zIndex: 1,
}))

// 数据变量定义
const records = ref([])
const lastAppointExpectTime = ref('')

// 引用变量定义
const recontractingRef = ref(null)
const appointmentRecordsRef = ref(null)

// 记录是否已经获取过数据
const hasLoadedAppointmentData = ref(false)

const refresh = () => {
  emit('refresh')
}
// 获取最后一次预约时间
const getLastAppointmentTime = async (incidentId) => {
  await getAppointList(incidentId).then((res) => {
    if (res.code == 200 && res.rows.length > 0) {
      if (res.rows[0].appointExpectTime) {
        lastAppointExpectTime.value = res.rows[0].appointExpectTime
      }
    }
  })
}

// 打开预约记录弹窗
const openAppointmentRecordsPopup = async () => {
  await getAppointListFn(basicInfo.value.id)
  appointmentRecordsRef.value?.open()
}

// 打开改约弹窗
const openRecontractingPopup = async () => {
  recontractingRef.value?.open()
}

// 获取预约记录列表
const getAppointListFn = async (incidentId) => {
  //每次加载清空旧数据
  records.value = []
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
        records.value.push(recordItme)
      })
      if (records.value.length > 0) {
        lastAppointExpectTime.value = records.value[0].time
      }
    }
  })
}

// 初始化函数 - 只获取预约时间
const init = async () => {
  if (basicInfo.value.id) {
    await getLastAppointmentTime(basicInfo.value.id)
  }
}

// 暴露方法给父组件调用
defineExpose({
  init,
})
</script>

<style lang="scss" scoped>
.fixed-content {
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.recontracting-view {
  padding: 0 10px;
  background: rgba(2, 76, 255, 0.8);
  opacity: 0.84;
  height: 50px;
  .recontracting-text {
    font-weight: 500;
    font-size: 13px;
    color: #ffffff;
  }
}

.recontracting-btn {
  height: 26px;
  background: #fefefe;
  border-radius: 14px;
  font-weight: 500;
  font-size: 14px;
  color: #4378fd;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

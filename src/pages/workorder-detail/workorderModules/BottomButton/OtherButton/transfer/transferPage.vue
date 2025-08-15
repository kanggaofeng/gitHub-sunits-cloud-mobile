<template>
  <view class="otherPage-container">
    <CustomNavBar title="转派" :back="true" backgroundColor="#2160fd"></CustomNavBar>
    <view class="formInfo">
      <Edit-Dialog ref="EditDialogRref" v-bind="tablePopData" v-model="paramForm" @update:model-value="handleModelValueChange" />
    </view>
    <view class="footer">
      <!-- <view class="btn cancel">取消</view> -->
      <view class="btn confirm" @click="save" :class="{ isLoading: isTransferring }">确定</view>
    </view>
  </view>
</template>

<script setup>
import EditDialog from '@/components/Edit-Dialog/Edit-Dialog.vue'
import { getStationUserListExcludeMyself } from '@/api/workOrder/index.js'
import { forwardIncTask } from '@/api/workOrder/index.js'
import useWorkOrderStore from '@/store/modules/workOrder'
import { projectEditAndAddCommonFn } from '@/composables/projectEditAndAddCommon.js'

const { proxy } = getCurrentInstance()

const workOrderStore = useWorkOrderStore()

const EditDialogRref = ref(null)
const isTransferring = ref(false)
const paramForm = ref({})
const tablePopData = ref({
  formItems: [
    {
      field: 'operateUserId',
      type: 'select',
      label: '转派人',
      options: [],
      isRequired: true,
    },
  ],
})

const handleModelValueChange = (val) => {
  paramForm.value = val
}

const save = () => {
  EditDialogRref.value.EditDialogPop.validate((valid) => {
    if (valid) {
      isTransferring.value = true
      const basicInfo = workOrderStore.basicInfo
      const data = {
        incidentId: basicInfo.id,
        activityId: basicInfo.currentActivityId,
        operateUserId: paramForm.value.operateUserId,
      }

      forwardIncTask(data)
        .then((res) => {
          if (res.code === 200) {
            workOrderStore.isWorkerListRefresh = true
            uni.showToast({
              title: res.msg || '转派成功',
              icon: 'success',
            })
            uni.switchTab({
              url: '/pages/tabBar/workorder/workorderPage', // 目标必须是 TabBar 页面
            })
          } else {
            uni.showToast({
              title: res.msg || '操作失败',
              icon: 'none',
            })
          }
        })
        .finally(() => {
          isTransferring.value = false
        })
    }
  })
}

const handleClose = () => {
  uni.navigateBack({
    delta: 2,
  })
}

// 获取转派人列表
const getTransferList = async () => {
  try {
    const workOrderInfo = workOrderStore.basicInfo
    const res = await getStationUserListExcludeMyself({
      stationId: workOrderInfo.stationId,
      currentPerson: workOrderInfo.currentPerson,
    })
    let options = []
    res.rows.forEach((item) => {
      options.push({
        label: item.nickName + ' (' + item.userName + ')',
        value: item.id,
      })
    })
    console.log('📢 [transferPage.vue:100]', options)
    updateFormItemOptions('operateUserId', options)
  } catch (error) {
    console.error('获取转派人列表失败:', error)
  }
}
const {
  updateFormItemOptions, // 更新表单项options
  updateFormItemAttribute, // 更新表单项attribute
} = projectEditAndAddCommonFn(tablePopData)
onMounted(() => {
  getTransferList()
})
</script>

<style lang="scss" scoped>
@import '@/pages/workorder-detail/workorderModules/BottomButton/OtherButton/otherPage.scss';
</style>

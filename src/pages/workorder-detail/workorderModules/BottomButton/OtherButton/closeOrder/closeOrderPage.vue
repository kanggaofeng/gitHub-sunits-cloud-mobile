<template>
  <view class="otherPage-container">
    <CustomNavBar title="关单" :back="true" backgroundColor="#2160fd"></CustomNavBar>
    <view class="formInfo">
      <Edit-Dialog ref="EditDialogRref" v-bind="tablePopData" v-model="paramForm" @update:model-value="handleModelValueChange" />
    </view>
    <view class="footer">
      <!-- <view class="btn cancel">取消</view> -->
      <view class="btn confirm" @click="save" :class="{ isLoading: isClosingOrder }">确定</view>
    </view>
  </view>
</template>

<script setup>
import EditDialog from '@/components/Edit-Dialog/Edit-Dialog.vue'
import { closeIncOrder } from '@/api/workOrder/index.js'
import useWorkOrderStore from '@/store/modules/workOrder'

const { proxy } = getCurrentInstance()
const workOrderStore = useWorkOrderStore()

const EditDialogRref = ref(null)
const isClosingOrder = ref(false)
const paramForm = ref({})
const tablePopData = ref({
  formItems: [
    {
      field: 'type',
      type: 'select',
      label: '关单原因',
      isRequired: true,
      options: proxy.getAllDict('closing_reason_type'),
    },
    {
      field: 'reason',
      type: 'textarea',
      label: '关单描述',
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
      isClosingOrder.value = true
      const basicInfo = workOrderStore.basicInfo
      paramForm.value.incidentId = basicInfo.id
      paramForm.value.activityId = basicInfo.currentActivityId
      closeIncOrder(paramForm.value)
        .then((res) => {
          if (res.code === 200) {
            workOrderStore.isWorkerListRefresh = true
            uni.showToast({
              title: res.msg || '关单成功',
              icon: 'success',
            })
            uni.switchTab({
              url: '/pages/tabBar/workorder/workorderPage', // 目标必须是 TabBar 页面
            })
          }
        })
        .finally(() => {
          isClosingOrder.value = false
        })
    }
  })
}

const handleClose = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
@import '@/pages/workorder-detail/workorderModules/BottomButton/OtherButton/otherPage.scss';
</style>

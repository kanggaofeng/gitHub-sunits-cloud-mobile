<template>
  <view class="otherPage-container">
    <CustomNavBar title="回退" :back="true" backgroundColor="#2160fd"></CustomNavBar>
    <view class="formInfo">
      <Edit-Dialog ref="EditDialogRref" v-bind="tablePopData" v-model="paramForm" @update:model-value="handleModelValueChange" />
    </view>
    <view class="footer">
      <!-- <view class="btn cancel">取消</view> -->
      <view class="btn confirm" @click="save" :class="{ isLoading: isRollingBack }">确定</view>
    </view>
  </view>
</template>

<script setup>
import EditDialog from '@/components/Edit-Dialog/Edit-Dialog.vue'
import { incReturnActivity } from '@/api/workOrder/index.js'
import useWorkOrderStore from '@/store/modules/workOrder'

const { proxy } = getCurrentInstance()
const workOrderStore = useWorkOrderStore()

const EditDialogRref = ref(null)
const isRollingBack = ref(false)
const paramForm = ref({})
const tablePopData = ref({
  formItems: [
    {
      field: 'type',
      type: 'select',
      label: '回退类型',
      isRequired: true,
      options: proxy.getAllDict('return_workorder'),
    },
    {
      field: 'reason',
      type: 'textarea',
      isRequired: true,
      label: '回退原因',
    },
  ],
})

const handleModelValueChange = (val) => {
  paramForm.value = val
}

const save = () => {
  EditDialogRref.value.EditDialogPop.validate((valid) => {
    if (valid) {
      isRollingBack.value = true
      const basicInfo = workOrderStore.basicInfo
      paramForm.value.incidentId = basicInfo.id
      paramForm.value.activityId = basicInfo.currentActivityId

      incReturnActivity(paramForm.value)
        .then((res) => {
          if (res.code === 200) {
            workOrderStore.isWorkerDetailRefresh = true
            handleClose()
          }
        })
        .finally(() => {
          isRollingBack.value = false
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

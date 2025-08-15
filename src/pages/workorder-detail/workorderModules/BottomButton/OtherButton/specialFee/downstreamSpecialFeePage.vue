<template>
  <view class="otherPage-container">
    <CustomNavBar title="下游特殊费用申请" :back="true" backgroundColor="#2160fd" />
    <view class="teFeiBtnContainer">
      <view class="view-desc-btn" @click="showDescPopup">
        <DsSvgIcon icon="icon-shenqingshuoming" :color="'#3870FD'" style="margin-right: 5px" :fontSize="'16px'" />
        查看申请说明
      </view>

      <view class="history-btn" @click="goHistory">
        <DsSvgIcon icon="icon-lishishenqingjilu" style="margin-right: 5px" :color="'#333333'" :fontSize="'16px'" />
        历史申请记录
        <div class="countMum" v-if="historyCount > 0">{{ historyCount }}</div>
        <!-- <uni-badge class="uni-badge-left-margin" :text="historyCount" v-if="historyCount > 0" /> -->
      </view>
    </view>
    <view class="formInfo">
      <EditDialog ref="editDialogRef" v-bind="tablePopData" v-model="paramForm" @update:model-value="handleModelValueChange" />
    </view>
    <wyh-image-preview v-if="isPreviewVisible" :images="previewImages" :initialIndex="previewIndex" @close="closeImagePreview" />
    <view class="footer">
      <!-- <view class="btn cancel">取消</view> -->
      <view class="btn confirm" @click="submit" :class="{ isLoading: isSubmitting }">确定</view>
    </view>
  </view>
</template>

<script setup>
import { specialFeeApply, getSpecialFeeList, getProjecrCommonConfig } from '@/api/xiangMu-peiZhi/specialFeeInfoApi.js'
import EditDialog from '@/components/Edit-Dialog/Edit-Dialog.vue'
import useWorkOrderStore from '@/store/modules/workOrder.js'
import { getFilesByIds } from '@/api/sys-file/sysFileAPI.js'
import { projectEditAndAddCommonFn } from '@/composables/projectEditAndAddCommon.js'
import OssFilesMultipleUpload from '@/components/OssFileUpload/OssFilesMultipleUpload.vue'
import WyhImagePreview from '@/components/wyh-image-preview/wyh-image-preview.vue'

const { proxy } = getCurrentInstance()
const workOrderStore = useWorkOrderStore()
const editDialogRef = ref(null)
const showDesc = ref(false)
const historyCount = ref(0) // 从接口获取历史记录总数
const isPreviewVisible = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)
const isSubmitting = ref(false)

const approvalBy = ref('')
const imageUrl = ref('')
const closeImagePreview = () => {
  isPreviewVisible.value = false
}
const commonConfig = ref({})
// 从projectEditAndAddCommonFn获取工具函数
const tablePopData = ref({
  formItems: [
    {
      field: 'applyType',

      type: 'select',
      label: '申请类型',
      isRequired: true,
      options: [],
    },
    {
      field: 'applyAmount',
      type: 'money',
      label: '申请金额(元)',
      isRequired: true,
      otherOptions: { type: 'number', placeholder: '请输入申请金额' },
    },
    {
      field: 'reason',
      type: 'textarea',
      label: '申请原因',
      isRequired: true,
      otherOptions: { placeholder: '请输入申请原因' },
    },
    {
      field: 'applyFile',
      type: 'img',
      label: '附件上传',
      isRequired: false,
      imgBaseInfo: { isMultiple: true, maximum: 9, isDisabled: false, autoUpload: true, btnShow: true, type: 'file', moduleName: 'specialCost' },
    },
  ],
})

const readonlyFileConfig = {
  isMultiple: true,
  maximum: 20,
  isDisabled: true,
  moduleName: 'specialCost',
  autoUpload: false,
  btnShow: false,
  type: 'file',
}
const showDescPopup = () => {
  previewImages.value = [imageUrl.value]
  previewIndex.value = 0
  isPreviewVisible.value = true
}

const getSpecialCostTypeList = async () => {
  let allList = proxy.getAllDict('special_cost_type')
  let workOrderInfo = useWorkOrderStore().basicInfo
  await getProjecrCommonConfig(workOrderInfo.projectId).then((res) => {
    if (res.code == 200) {
      commonConfig.value = res.data
      let data = res.data
      let specialCostTypeList = data.specialCostType.split(',')
      let shenQingOption = allList.filter((item) => specialCostTypeList.includes(item.value))
      updateFormItemOptions('applyType', shenQingOption)
      if (data.approvalByType == 0) {
        approvalBy.value = data.approvalGroup
      } else {
        approvalBy.value = useWorkOrderStore().basicInfo.regionLeader
      }

      getFiles(commonConfig.value.approvalApplyDescImg).then((res) => {
        imageUrl.value = res[0].url
      })
    }
  })
}

// 获取历史记录总数
const getHistoryCount = async () => {
  try {
    const basicInfo = workOrderStore.basicInfo
    if (basicInfo?.id) {
      const res = await getSpecialFeeList({
        incidentId: basicInfo.id,
        pageNum: 1,
        pageSize: 1, // 只需要获取总数，所以pageSize设为1
      })
      if (res.code === 200) {
        historyCount.value = res.total || 0
      }
    }
  } catch (error) {
    console.error('获取历史记录总数失败:', error)
    historyCount.value = 0
  }
}
// 获取文件列表
const getFiles = async (value) => {
  try {
    const res = await getFilesByIds({ fileIds: value })
    if (res.data && res.data.length > 0) {
      return res.data
    }
    return []
  } catch (error) {
    console.error('获取文件列表失败:', error)
    throw error
  }
}

onMounted(() => {
  getSpecialCostTypeList()
  getHistoryCount()
})

const paramForm = ref({
  applyType: '',
  applyAmount: '',
  reason: '',
  applyFile: '',
})

const handleModelValueChange = (val) => {
  paramForm.value = val
}

// 重置表单数据
const resetForm = () => {
  paramForm.value = {}
}

function goBack() {
  uni.navigateBack()
}

function goHistory() {
  uni.navigateTo({
    url: '/pages/workorder-detail/workorderModules/BottomButton/OtherButton/specialFee/downstreamSpecialFeeHistoryPage',
  })
}

function submit() {
  if (editDialogRef.value) {
    console.log(paramForm.value)
    editDialogRef.value.EditDialogPop.validate((valid) => {
      if (valid) {
        // TODO: 提交逻辑
        const basicInfo = workOrderStore.basicInfo
        paramForm.value.incidentId = basicInfo.id
        isSubmitting.value = true
        paramForm.value.approvalBy = approvalBy.value
        if (commonConfig.value.approvalByType == 1 && !paramForm.value.approvalBy) {
          uni.showToast({
            title: '请检查当前工单或项目配置，暂无区域协调',
            icon: 'none',
          })
          isSubmitting.value = false
        } else {
          specialFeeApply(paramForm.value)
            .then((response) => {
              uni.showToast({
                title: '申请成功',
              })
              // 提交成功后清空表单数据
              resetForm()
              // 提交成功后刷新历史记录总数
              getHistoryCount()
            })
            .finally(() => {
              isSubmitting.value = false
            })
        }
      }
    })
  }
}

const { updateFormItemOptions, updateFormItemAttribute } = projectEditAndAddCommonFn(tablePopData)
</script>

<style lang="scss">
@import '@/pages/workorder-detail/workorderModules/BottomButton/OtherButton/otherPage.scss';
.teFeiBtnContainer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  padding-top: 15px;
  padding-bottom: 0;

  .view-desc-btn {
    flex: 1;
    margin-right: 10px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    font-size: 14px;
    color: #3870fd;
    transition: all 0.3s ease;
    cursor: pointer;
    background: #ffffff;
    border-radius: 8px;
  }

  .history-btn {
    height: 40px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    background: #ffffff;
    border-radius: 8px;
    color: #333333;

    .countMum {
      background: red;
      color: #fff;
      padding: 0 8px;
      height: 18px;
      display: flex;
      transform: scale(0.8);
      transform-origin: center center;
      align-items: center;
      font-size: 10px;
      font-weight: 600;
      text-align: center;
      border-radius: 4px;
      margin-left: 5px;
      position: relative;
    }
  }
}
.desc-popup {
  min-height: 80vh;
  background-color: #fff;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;

  .desc-header {
    padding: 10px 10px;
    border-bottom: 1px solid #e9ecef;
    background-color: #f8f9fa;

    .desc-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
  }

  .desc-content {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
  }
}
// 修改后的样式 - 修复选择器并添加深度选择器
:deep(.form-input-container.auto-height) {
  border: 1px solid white !important;
  padding: 0 !important;
}
:deep(.img-upload-container) {
  min-height: 0 !important;
}
</style>

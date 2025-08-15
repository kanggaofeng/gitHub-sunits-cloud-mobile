<template>
  <view>
    <CustomNavBar title="附件信息" :back="true" backgroundColor="#fff" statusBarBackgroundColor="#fff" color="#000" statusBarTextStyle="black"></CustomNavBar>
    <view class="files-container">
      <OssFilesMultipleUpload ref="OssFilesMultipleUploadRef" v-model="fileIds" :imgBaseInfo="imgBaseInfo" @update:model-value="saveFiles"></OssFilesMultipleUpload>
    </view>
  </view>
</template>

<script setup>
import OssFilesMultipleUpload from '@/components/OssFileUpload/OssFilesMultipleUpload.vue'
import { saveIncFileInfo, getIncFileInfo } from '@/api/workOrder/index.js'
import { ref, watch } from 'vue'
import useWorkOrderStore from '@/store/modules/workOrder'

const { proxy } = getCurrentInstance()
const workOrderStore = useWorkOrderStore()
const basicInfo = computed(() => workOrderStore.basicInfo)

const fileIds = ref('')
const localWorkorderId = ref('')

onLoad((options) => {
  localWorkorderId.value = options.workorderId
  init()
})

const imgBaseInfo = computed(() => ({
  isMultiple: true, // 是否支持多文件上传
  maximum: 10, // 最大上传数量
  isDisabled: basicInfo.value && basicInfo.value.izEdit === 0, // 是否禁用上传
  moduleName: 'workOrder', // 模块名称
  autoUpload: true, // 是否选择文件后自动上传
  btnShow: true, // 是否显示上传按钮
  type: 'file',
}))

const init = () => {
  getIncFileInfo({
    incidentId: localWorkorderId.value,
  }).then((res) => {
    if (res.code == 200) {
      let files = res.data.incFileList
      fileIds.value = files.map((item) => item.fileId).join(',')
    }
  })
}

const saveFiles = async (value) => {
  let data = {
    fileIdList: value.split(','),
    incidentId: localWorkorderId.value,
  }
  const res = await saveIncFileInfo(data)
}
</script>

<style lang="scss" scoped>
.files-container {
  padding: 10px;
}
</style>

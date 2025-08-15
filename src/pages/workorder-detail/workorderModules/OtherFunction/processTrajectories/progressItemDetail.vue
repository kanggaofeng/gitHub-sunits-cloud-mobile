<template>
  <div>
    <!--操作提示块-->
    <div class="progress-item-detail" v-if="incActivityDetailInfo.operationRecordList && incActivityDetailInfo.operationRecordList.length > 0">
      <div class="remind-info" v-for="item in incActivityDetailInfo.operationRecordList">
        <div>
          <h4>{{ item.remark }}</h4>
        </div>
        <div class="item-info">
          <view>
            <view>
              <span class="title">{{ computerFieldLabel(item.operationType) }}类型：</span>
              <span>{{ item.operationDescription ? item.operationDescription : '--' }}</span>
            </view>
            <view>
              <span class="title">{{ computerFieldLabel(item.operationType) }}原因：</span>
              <span>{{ item.operationDescription ? item.operationDescription : '--' }}</span>
            </view>
          </view>
        </div>
      </div>
    </div>

    <!--预约信息块-->
    <div class="progress-item-detail" v-if="incActivityDetailInfo.appointInfo && incActivityDetailInfo.appointInfo.length > 0">
      <div>
        <h4>预约信息</h4>
        <div class="item-info">
          <view>
            <view v-for="item in incActivityDetailInfo.appointInfo" :key="item.id">
              <span class="title">{{ item.displayName }}:</span>
              <span>{{ item.fieldValue ? item.fieldValue : '--' }}</span>
            </view>
          </view>
        </div>
      </div>
    </div>

    <!--节点信息块-->
    <div class="progress-item-detail" v-if="incActivityDetailInfo.fieldVos && incActivityDetailInfo.fieldVos.length > 0">
      <div>
        <h4>节点信息</h4>
        <div class="item-info">
          <view>
            <view v-for="item in incActivityDetailInfo.fieldVos" :key="item.id">
              <div v-if="item.fieldType !== 'attachment'">
                <span class="title">{{ item.displayName }}:</span>
                <span>{{ item.fieldValue ? item.fieldValue : '--' }}</span>
              </div>

              <div v-else>
                <span class="title">{{ item.displayName }}:</span>
                <OssFilesMultipleUpload ref="OssFilesMultipleUploadRef" v-model="item.fieldId" :imgBaseInfo="imgBaseInfo"></OssFilesMultipleUpload>
              </div>
            </view>
          </view>
        </div>
      </div>
    </div>

    <!--服务信息块-->
    <div class="progress-item-detail" v-if="incActivityDetailInfo.izShowServiceModel && incActivityDetailInfo.izShowServiceModel == 1">
      <div>
        <h4>服务信息</h4>
        <div class="item-info">
          <view>
            <view>
              <span class="title">实际故障分类：</span>
              <span>{{ incActivityDetailInfo.faultClassActual ? incActivityDetailInfo.faultClassActual : '--' }}</span>
            </view>
            <view>
              <span class="title">实际解决方案：</span>
              <span>{{ incActivityDetailInfo.solutionSugActual ? incActivityDetailInfo.solutionSugActual : '--' }}</span>
            </view>
          </view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import OssFilesMultipleUpload from '@/components/OssFileUpload/OssFilesMultipleUpload.vue';
const { proxy } = getCurrentInstance()

const props = defineProps({
  incActivityDetailInfo: {
    type: Object,
    default: () => ({}),
  },
})

const createDictMap = (key) => {
  const list = proxy.getAllDict(key)
  return new Map(list.map((item) => [String(item.value), item.label])) // Map key 全部转为字符串
}

let rejectionReasonMap = createDictMap('rejection_workorder')
let cancleReasonMap = createDictMap('cancel_workorder')
let closingReasonMap = createDictMap('closing_reason_type')
let returnReasonMap = createDictMap('return_workorder')
// let cancleReasonMap = createDictMap('cancle_reason');

const computerFieldLabel = (type) => {
  switch (type) {
    case '1':
      return '转派'
    case '2':
      return '重派'
    case '3':
      return '回退'
    case '4':
      return '撤单'
    case '5':
      return '拒单'
    case '6':
      return '改约'
  }
}

const imgBaseInfo = ref({
  isMultiple: false, // 是否支持多文件上传
  maximum: 10, // 最大上传数量
  isDisabled: true, // 是否禁用上传
  moduleName: 'activityDetail', // 模块名称
  autoUpload: false, // 是否选择文件后自动上传
  btnShow: false, // 是否显示上传按钮
  type: 'file', // 上传类型
})

const nodeItem = ref({})

const computerColSpan = (type) => {
  switch (type) {
    case 'select':
      return 12
    case 'text':
      return 12
    case 'textarea':
      return 24
    case 'date':
      return 12
    case 'dateRange':
      return 24
    case 'radio':
      return 12
    case 'time':
      return 12
    case 'attachment':
      return 24
    default:
      return 24
  }
}
</script>

<style scoped lang="css">
.progress-item-detail {
  font-size: 10px;
  border-radius: 4px;
  padding: 10px 12px;
}
.title {
  display: inline-block;
  width: 85px;
  font-size: 12px;
  font-weight: 500;
  color: #95969f;
  line-height: 18px;
}
.item-info {
  margin-top: 3px;
}
h4 {
  font-weight: 600;
  font-size: 12px;
}
</style>

<template>
  <view>
    <!-- 预约信息组件 -->
    <AppointmentDetails :data="appointInfo" :izShowSubmitAppointment="izShowSubmitAppointment" v-if="izShowAppointModel == 1" ref="appointmentDetailsRef" @sendData="sendData" @upData="upData" />

    <!-- 节点信息 -->
    <div class="formInfo-container" v-if="initTablePopData.formItems.length">
      <view class="card-container">
        <view class="card-title">节点信息</view>
        <Edit-Dialog ref="EditDialogRref" v-bind="initTablePopData" v-model="formData"></Edit-Dialog>
        <div class="zancunBtn" @tap="save" v-if="basicInfo.izEdit === 1">暂存</div>
      </view>
    </div>

    <!-- 服务信息 -->
    <ServiceInfo ref="serviceInfoRef" v-if="izShowServiceModel == 1" :hide="serviceInfoHide" :data="serviceInfoData" />

    <!-- 派单信息 app 用不到-->
    <!-- <DispatchMode ref="DispatchInfoRef" v-if="izShowAssignModel == 1" /> -->
  </view>
</template>

<script setup>
import AppointmentDetails from './components/AppointmentDetails.vue'
import ServiceInfo from './components/ServiceInfo.vue'
// import DispatchMode from './components/DispatchMode/DispatchMode.vue'
import EditDialog from '@/components/Edit-Dialog/Edit-Dialog.vue'
import { getCustomForm, tempSave, nextStepSave, nextStepForward } from '@/api/workOrder/nodeInfo.js'
import { getFilesByIds } from '@/api/sys-file/sysFileAPI'
import useWorkOrderStore from '@/store/modules/workOrder'

const { proxy } = getCurrentInstance()
const workOrderStore = useWorkOrderStore()
const basicInfo = computed(() => workOrderStore.basicInfo)

// 事件
const emit = defineEmits(['refresh', 'processIdChange', 'upData', 'appointFloatingWinFlag', 'nextNodeLoding'])

// 组件引用
const appointmentDetailsRef = ref(null)
const serviceInfoRef = ref(null)
const EditDialogRref = ref(null)
const izShowChangeContractBtn = ref(false) //改约
const izShowAppointFloatingWin = ref(false) //预约记录

// 数据初始化
const formData = ref({})
const rules = ref({})
const initTablePopData = ref({
  formItems: [],
  labelPosition: 'top',
})
const fieldVos = ref({})
const incActivityId = ref(null)
const izShowAppointModel = ref(null) // 是否显示预约模块信息
const appointInfo = ref(null) // 预约模块信息
const serviceInfoData = ref({})
const izShowServiceModel = ref(null) // 是否显示服务模块信息
const serviceInfoHide = ref(null)
const izShowAssignModel = ref(null) // 是否显示派单信息
const izShowAssignType = ref(null) // =1显示网点和工程 =2显示区域负责人
const izShowSubmitAppointment = ref(0) // 是否显示提交预约按钮

// 获取自定义表单数据
const getCustomFormFn = (incidentId, activityId, newValue) => {
  getCustomForm(incidentId, activityId).then((res) => {
    incActivityId.value = res.data.incActivityId
    fieldVos.value = res.data
    izShowAppointModel.value = res.data.izShowAppointModel
    izShowServiceModel.value = res.data.izShowServiceModel

    // 更新 store 中的按钮状态
    workOrderStore.setButtonStatus(res.data.izShowChangeContractBtn, res.data.izShowAppointFloatingWin)

    if (res.data.appointInfo) {
      izShowSubmitAppointment.value = res.data.izShowSubmitAppointment
      appointInfo.value = res.data.appointInfo
      appointInfo.value.incActivityId = res.data.incActivityId
      appointInfo.value.incidentId = incidentId
    }

    serviceInfoData.value = {
      incActivityId: res.data.incActivityId,
      faultClassActual: res.data.faultClassActual, // 故障分类
      solutionSugActual: res.data.solutionSugActual, // 解决方案
    }

    serviceInfoHide.value = {
      izShowFaultClass: res.data.izShowFaultClass,
      izShowSolutionSug: res.data.izShowSolutionSug,
    }

    sortedFields()

    // 是否显示派单信息
    if (res.data.izShowAssignModel == 1) {
      izShowAssignModel.value = 1
      izShowAssignType.value = res.data.izShowAssignType

      nextTick(() => {
        if (proxy.$refs.DispatchInfoRef) {
          // console.log({
          //   ...newValue,
          //   distribution: izShowAssignType.value,
          // })
          proxy.$refs.DispatchInfoRef.initDispatchInfo([], newValue, {
            ...newValue,
            distribution: izShowAssignType.value,
            dispatchRange: res.data.izShowAssignDispatchRange,
          })
        }
      })
    }

    emit('appointFloatingWinFlag', res.data.izShowAppointFloatingWin)
  })
}

// 输入组件类型转换
const renderInputComponent = (fieldType) => {
  switch (fieldType) {
    case 'text':
      return 'input'
    case 'textarea':
      return 'textarea'
    case 'time':
      return 'datetime'
    case 'date':
      return 'datepicker'
    case 'attachment':
      return 'image'
    default:
      return fieldType
  }
}

// 更新数据
const upData = () => {
  emit('refresh')
}

// 发送数据
const sendData = (value) => {
  console.log('接收到子组件数据:', value)
}

// 图片上传配置
const imgBaseInfo = computed(() => ({
  isMultiple: true, // 是否支持多文件上传
  maximum: 10, // 最大上传数量
  isDisabled: basicInfo.value && basicInfo.value.izEdit === 0, // 是否禁用上传
  moduleName: 'workOrder', // 模块名称
  autoUpload: true, // 是否选择文件后自动上传
  btnShow: true, // 是否显示上传按钮
  type: 'img',
}))

// 获取图片
const getImgs = async (value) => {
  try {
    const res = await getFilesByIds({ fileIds: value })
    if (res.data && res.data.length > 0) {
      let data = res.data
      data.forEach((item) => {
        item.name = item.oldFileName + '.' + item.fileType
      })
      return data
    } else {
      return []
    }
  } catch (error) {
    console.error('getFiles error:', error)
    return []
  }
}

// 处理表单字段
const sortedFields = async () => {
  const newRules = {}
  let arr = fieldVos.value.fieldVos || []
  let sorted = arr
    .map((fieldItem) => ({
      isRequired: fieldItem.isRequired,
      label: fieldItem.displayName,
      type: renderInputComponent(fieldItem.fieldType),
      colSpan: fieldItem.fieldType === 'textarea' || fieldItem.fieldType == 'attachment' ? 24 : 12,
      field: fieldItem.fieldId,
      options: fieldItem.treeData,
      imgBaseInfo: fieldItem.fieldType == 'attachment' ? imgBaseInfo.value : {},
      defaultValue: fieldItem.fieldType == 'attachment' ? fieldItem.defaultValue : null,
      otherOptions: { disabled: basicInfo.value.izEdit === 0 ? true : false },
    }))
    .sort((a, b) => a.order - b.order || 0)

  arr.forEach((item) => {
    if (item.fieldValue) formData.value[item.fieldId] = item.fieldValue
  })

  for (const field of sorted) {
    if (field.type == 'image' && field.defaultValue) {
      field.imgs = await getImgs(field.defaultValue)
    }
    if (field.isRequired == '1') {
      newRules[field.field] = [{ required: true, message: `请输入${field.label}`, trigger: 'blur' }]
    } else {
      newRules[field.field] = [{ required: false }]
    }
  }

  initTablePopData.value.formItems = sorted
  rules.value = newRules
  // console.log('📢 [NodeInfo.vue:218]', formData)
}

// 反向转换组件类型
const renderInputComponent2 = (fieldType) => {
  switch (fieldType) {
    case 'input':
      return 'text'
    case 'datetime':
      return 'time'
    case 'datepicker':
      return 'date'
    case 'image':
      return 'attachment'
    default:
      return fieldType
  }
}

// 创建表单数据
const createIncActFieldVoList = () => {
  const incActFieldVoList = initTablePopData.value.formItems.map((item) => {
    return {
      displayName: item.label,
      fieldId: item.field,
      fieldType: renderInputComponent2(item.type),
      fieldValue: formData.value[item.field] || '',
    }
  })
  return incActFieldVoList
}

// 暂存表单
const save = () => {
  let data = {
    incidentId: basicInfo.value.id,
    incActivityId: fieldVos.value.incActivityId,
    incActFieldVoList: createIncActFieldVoList(),
  }

  tempSave(data)
    .then((res) => {
      uni.showToast({
        title: '暂存成功',
        icon: 'success',
      })
    })
    .catch((err) => {
      uni.showToast({
        title: '暂存失败',
        icon: 'none',
      })
    })
}

// 验证表单
const handleSubmit = () => {
  return new Promise((resolve, reject) => {
    EditDialogRref.value.EditDialogPop.validate((valid, errors) => {
      if (valid) {
        console.log(valid)
        console.log(formData.value)
        resolve(formData.value)
      } else {
        reject('提交失败')
      }
    })
  })
}

// 提交所有数据
const changeData = async () => {
  console.log('开始处理数据')
  let params = {}

  try {
    // 验证并处理预约信息
    if (izShowAppointModel.value == 1 && appointmentDetailsRef.value) {
      const res = await appointmentDetailsRef.value.changeData()
      console.log(res, '预约数据')
      params = { ...params, incAppoint: res }
    }

    // 验证并处理节点信息
    if (initTablePopData.value.formItems.length) {
      const res = await handleSubmit()
      console.log(createIncActFieldVoList(), '节点数据')
      params = { ...params, incActFieldVoList: createIncActFieldVoList() }
    }

    // 验证并处理服务信息
    if (izShowServiceModel.value == 1 && serviceInfoRef.value) {
      const res = await serviceInfoRef.value.changeData()
      console.log(res, '服务信息')
      params = { ...params, ...res }
    }

    // 验证并处理派单信息
    if (izShowAssignModel.value == 1 && proxy.$refs.DispatchInfoRef) {
      const res = await proxy.$refs.DispatchInfoRef.submitForm()
      console.log(res, '派单信息')
      if (izShowAssignType.value == 1) {
        params = { ...params, receivePerson: res.receivePerson, serviceStationId: res.serviceStationId }
      } else if (izShowAssignType.value == 2) {
        params = { ...params, receivePerson: res.receivePerson }
      } else {
        params = { ...params, ...res }
      }
    }

    // 所有数据处理完成
    params = {
      ...params,
      incActivityId: incActivityId.value,
      incidentId: basicInfo.value.id,
    }
    console.log(params, '提交参数')
    uni.showModal({
      title: '提示',
      content: '是否确认操作?',
      showCancel: false,
      showCancel: true,
      confirmText: '确定',
      success: function (res) {
        if (res.confirm) {
          // 保存数据
          emit('nextNodeLoding', true)

          nextStepSave(params).then((res) => {
            // 前进到下一步
            nextStepForward({
              incActivityId: incActivityId.value,
              incidentId: basicInfo.value.id,
              receivePerson: params.receivePerson,
              serviceStationId: params.serviceStationId,
            }).then((res1) => {
              if (res1.data && res1.data.izInterrupted == 0) {
                console.log('刷新页面')
                workOrderStore.isWorkerListRefresh = true
                emit('refresh')
              } else if (res1.data && res1.data.izInterrupted == 1) {
                workOrderStore.isWorkerListRefresh = true
                clickClose()
              }
            })
          }).catch((err) => {
            emit('nextNodeLoding', false)
            console.error(err)
          })
        }
      },
    })
  } catch (err) {
    console.error('提交数据过程中发生错误:', err)
  }
}

const clickClose = () => {
  // 使用uni的方式导航回上一页
  uni.navigateBack()
}

// 暴露方法
defineExpose({
  changeData,
  getCustomFormFn,
})
</script>

<style lang="scss" scoped>
@import '@/components/Edit-Dialog/compont/Edit-Dialog.scss';
</style>

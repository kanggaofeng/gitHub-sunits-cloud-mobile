<template>
  <view class="formInfo-container">
    <view class="card-container">
      <view class="card-title">服务信息</view>

      <view class="form-item" v-if="hide.izShowFaultClass == 1">
        <view class="form-title">
          <text class="required-star red">*</text>
          <text>故障分类</text>
        </view>
        <view class="form-input-container" :class="{ 'is-disabled': isFormDisabled }">
          <input v-model="formData.faultClassActual" placeholder="请输入故障分类" class="form-input" :disabled="isFormDisabled" />
        </view>
      </view>

      <view class="form-item" v-if="hide.izShowSolutionSug == 1">
        <view class="form-title">
          <text class="required-star red">*</text>
          <text>解决方案</text>
        </view>
        <view class="form-input-container" :class="{ 'is-disabled': isFormDisabled }">
          <input v-model="formData.solutionSugActual" placeholder="请输入解决方案" class="form-input" :disabled="isFormDisabled" />
        </view>
      </view>

      <view class="zancunBtn" @tap="handleSubmit" v-if="!isFormDisabled">暂存</view>
    </view>
  </view>
</template>

<script setup>
import useWorkOrderStore from '@/store/modules/workOrder'
const { proxy } = getCurrentInstance()
let workOrderStore = useWorkOrderStore()
import { updateIncServiceInfo } from '@/api/workOrder/nodeInfo.js'

const props = defineProps({
  hide: {
    type: Object,
    default: () => {},
  },
  data: {
    type: Object,
    default: () => {},
  },
})

// 控制表单是否禁用
const isFormDisabled = computed(() => {
  return workOrderStore.basicInfo.izEdit === 0
})

const formData = ref({
  faultClassActual: '', // 故障分类
  solutionSugActual: '', // 解决方案
})

watch(
  () => props.data,
  (newValue) => {
    if (newValue) {
      formData.value.faultClassActual = newValue.faultClassActual || ''
      formData.value.solutionSugActual = newValue.solutionSugActual || ''
    }
  },
  { immediate: true },
)

const validateForm = () => {
  // 故障分类验证
  if (props.hide.izShowFaultClass == 1 && !formData.value.faultClassActual) {
    uni.showToast({
      title: '请输入故障分类',
      icon: 'none',
    })
    return false
  }

  // 解决方案验证
  if (props.hide.izShowSolutionSug == 1 && !formData.value.solutionSugActual) {
    uni.showToast({
      title: '请输入解决方案',
      icon: 'none',
    })
    return false
  }

  return true
}

// 提交表单
const handleSubmit = () => {
  if (!formData.value.faultClassActual && !formData.value.solutionSugActual) {
    uni.showToast({
      title: '请输入故障分类或解决方案',
      icon: 'none',
    })
    return
  }
  // if (!validateForm()) return

  console.log('表单数据:', formData.value)
  let basicInfo = workOrderStore.basicInfo
  let obj = {
    incActivityId: props.data.incActivityId,
    incidentId: basicInfo.id,
    ...formData.value,
  }
  updateIncServiceInfo(obj)
    .then((res) => {
      console.log(res)
      if (res.code == 200) {
        uni.showToast({
          title: '暂存成功',
          icon: 'success',
        })
      } else {
        uni.showToast({
          title: res.msg || '暂存失败',
          icon: 'none',
        })
      }
    })
    .catch(() => {
      uni.showToast({
        title: '暂存失败',
        icon: 'none',
      })
    })
}

const changeData = () => {
  return new Promise((resolve, reject) => {
    if (validateForm()) {
      resolve(formData.value)
    } else {
      reject('提交失败')
    }
  })
}

defineExpose({
  changeData,
})
</script>

<style lang="scss" scoped>
@import '@/components/Edit-Dialog/compont/Edit-Dialog.scss';
</style>

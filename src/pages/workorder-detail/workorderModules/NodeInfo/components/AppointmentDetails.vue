<template>
  <view class="formInfo-container">
    <view class="card-container">
      <view class="card-title">预约信息</view>

      <!-- 预约状态 -->
      <view class="form-item">
        <view class="form-title">
          <text class="required-star red">*</text>
          <text>预约状态</text>
        </view>
        <view class="form-input-container">
          <radio-group class="radio-group" @change="(e) => handleRadioChange(e.detail.value)" :disabled="isFormDisabled">
            <label v-for="item in statusList" :key="item.value" class="radio-item" :class="{ 'is-disabled': isFormDisabled }">
              <radio :value="item.value" :checked="formData.appointStatus === item.value" :disabled="isFormDisabled" />
              <text class="radio-label" :class="{ 'is-disabled': isFormDisabled }">{{ item.label }}</text>
            </label>
          </radio-group>
        </view>
      </view>

      <!-- 预约时间 - 使用DateTimePicker组件 -->
      <view class="form-item" v-if="formData.appointStatus === '1'">
        <view class="form-title">
          <text class="required-star red">*</text>
          <text>预约时间</text>
        </view>
        <view class="form-input-container" :class="{ 'is-disabled': isFormDisabled }">
          <DateTimePicker v-model="formData.appointExpectTime" mode="datetime" placeholder="请选择预约时间" class="date-picker" :disabled="isFormDisabled" @change="handleDateChange" />
        </view>
      </view>

      <!-- 未预约/失败原因 -->
      <view class="form-item" v-if="formData.appointStatus === '2' || formData.appointStatus === '3'">
        <view class="form-title">
          <text class="required-star red">*</text>
          <text>{{ formData.appointStatus === '2' ? '未预约原因' : '失败原因' }}</text>
        </view>
        <view class="form-input-container">
          <view class="select-input" @tap="showReasonSelector" :class="{ 'is-disabled': isFormDisabled }">
            <text v-if="reasonLabel" class="select-text">{{ reasonLabel }}</text>
            <text v-else class="select-placeholder">{{ formData.appointStatus === '2' ? '请选择未预约原因' : '请选择失败原因' }}</text>
            <view class="select-arrow">
              <uni-icons type="down" size="14" color="rgb(187, 187, 187)"></uni-icons>
            </view>
          </view>
        </view>
      </view>

      <!-- 预约备注 -->
      <view class="form-item">
        <view class="form-title">
          <text>备注</text>
        </view>
        <view class="form-input-container" :class="{ 'is-disabled': isFormDisabled }">
          <textarea v-model="formData.appointDesc" placeholder="请输入备注信息" class="form-textarea" :disabled="isFormDisabled"></textarea>
        </view>
      </view>

      <div class="formSubmitBtn" v-if="izShowSubmitAppointment == 1" @click="handleSubmit">提交</div>
    </view>

    <!-- 原因选择器 - 使用lb-picker -->
    <lb-picker ref="reasonSelector" mode="selector" :props="pickerProps" :list="currentReasonOptions" @confirm="handleReasonConfirm"></lb-picker>
  </view>
</template>

<script setup>
import { appoint } from '@/api/workOrder/nodeInfo.js'
import useWorkOrderStore from '@/store/modules/workOrder'
import DateTimePicker from '@/components/Edit-Dialog/compont/DateTimePicker.vue'
import lbPicker from '@/components/lb-picker/index.vue' // 导入lb-picker组件

// 获取工作单实例
const workOrderStore = useWorkOrderStore()
const { proxy } = getCurrentInstance()

// 获取字典数据 - 与PC端使用相同的方法
const statusList = computed(() => {
  // 过滤掉未联系(0)选项
  return proxy.getAllDict('appointment_status').filter((item) => item.value !== '0')
})
const unappointReason = proxy.getAllDict('unappoint_reason') // 未预约原因
const appointFailReason = proxy.getAllDict('appoint_fail_reason') // 联系失败原因
// 0-未联系 1-已联系已预约 2-未预约 3-联系失败

// 属性接收 - 与PC端保持一致
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  izShowSubmitAppointment: {
    type: Number,
    default: 0,
  },
})

// 事件发射
const emit = defineEmits(['upData', 'sendData'])

// 组件引用
const reasonSelector = ref(null)

// 表单数据
const formData = ref({
  appointStatus: '', // 默认选中第一个(0-未联系)
  appointExpectTime: '',
  reasonDict: '',
  appointDesc: '',
})

// 是否已提交成功
const isSubmitted = ref(false)

// 控制表单是否禁用
const isFormDisabled = computed(() => {
  // 如果工单不可编辑，则禁用整个表单

  // 如果是已联系已预约状态(1)
  if (formData.value.appointStatus === '1') {
    // 如果是回显数据且有预约时间，则禁用整个表单
    if (props.data?.appointExpectTime) {
      return true
    }
    // 如果已提交成功，则禁用
    if (isSubmitted.value) {
      return true
    }
  }
  return false
})

// 控制单选按钮组是否禁用
const isRadioDisabled = computed(() => {
  // 如果是已联系已预约状态且表单被禁用，则禁用所有单选按钮
  if (formData.value.appointStatus === '1' && isFormDisabled.value) {
    return true
  }
  return false
})

// Picker配置
const pickerProps = {
  label: 'label',
  value: 'value',
}

// 当前可选的原因列表
const currentReasonOptions = computed(() => {
  return formData.value.appointStatus === '2' ? unappointReason : appointFailReason
})

// 显示的原因标签
const reasonLabel = computed(() => {
  const list = formData.value.appointStatus === '2' ? unappointReason : appointFailReason
  const selected = list.find((item) => item.value === formData.value.reasonDict)
  return selected ? selected.label : ''
})

// 监听属性变化
watch(
  () => props.data,
  (newVal) => {
    if (!newVal) return

    // 确保所有值都正确设置
    formData.value.appointStatus = newVal.appointStatus !== undefined ? newVal.appointStatus : '0'
    formData.value.appointExpectTime = newVal.appointExpectTime || ''
    formData.value.reasonDict = newVal.reasonDict || ''
    formData.value.appointDesc = newVal.appointDesc || ''

    // 如果有回显数据且有预约时间，设置为已提交状态
    isSubmitted.value = !!(newVal.appointExpectTime && newVal.appointStatus === '1')
  },
  { immediate: true, deep: true },
)

// 处理单选按钮变化
const handleRadioChange = (value) => {
  // 如果表单被禁用，不允许改变状态
  if (isFormDisabled.value) return

  formData.value.appointStatus = value
}

// 禁用当前时间之前的日期 - 与PC端一致
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用过去日期
}

// 处理日期变化 - 使用DateTimePicker组件的变化事件
const handleDateChange = (date) => {
  // 确保日期格式正确
  if (date && typeof date === 'string') {
    formData.value.appointExpectTime = date
  } else if (date instanceof Date) {
    formData.value.appointExpectTime = formatDate(date)
  }

  // 更新时间范围
  updateTimeRange()
}

// 更新时间范围 - 与PC端一致
const updateTimeRange = () => {
  if (formData.value.appointExpectTime) {
    const selectedTime = new Date(formData.value.appointExpectTime)
    formData.value.appointExpectTime = formatDate(selectedTime)
  }
}

// 格式化日期 - 与PC端一致
const formatDate = (date) => {
  if (!(date instanceof Date)) {
    return ''
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 显示原因选择器
const showReasonSelector = () => {
  if (isFormDisabled.value) return
  reasonSelector.value.show()
}

// 处理原因选择确认
const handleReasonConfirm = (e) => {
  formData.value.reasonDict = e.value
}

// 验证表单 - 实现与PC端一致的验证逻辑
const validateForm = () => {
  // 预约状态验证
  if (!formData.value.appointStatus) {
    uni.showToast({
      title: '请选择预约状态',
      icon: 'none',
    })
    return false
  }

  // 预约时间验证 - 仅当状态为"已预约"时验证
  if (formData.value.appointStatus === '1' && !formData.value.appointExpectTime) {
    uni.showToast({
      title: '请选择预约时间',
      icon: 'none',
    })
    return false
  }

  // 未预约/联系失败原因验证
  if ((formData.value.appointStatus === '2' || formData.value.appointStatus === '3') && !formData.value.reasonDict) {
    uni.showToast({
      title: formData.value.appointStatus === '2' ? '请选择未预约原因' : '请选择失败原因',
      icon: 'none',
    })
    return false
  }

  return true
}

// 提交表单
const handleSubmit = () => {
  // 如果表单被禁用，直接返回
  if (isFormDisabled.value) return

  if (!validateForm()) return

  const basicInfo = workOrderStore.basicInfo
  const obj = {
    incActivityId: props.data?.incActivityId,
    incidentId: basicInfo.id,
    appointStatus: formData.value.appointStatus,
    appointExpectTime: formData.value.appointExpectTime,
    reasonDict: formData.value.reasonDict,
    appointDesc: formData.value.appointDesc,
  }

  appoint(obj)
    .then((res) => {
      if (res.code == 200) {
        uni.showToast({
          title: '提交成功',
          icon: 'success',
        })

        // 更新表单数据
        formData.value = { ...obj }
        // 设置提交成功标记
        isSubmitted.value = true

        emit('upData')
      } else {
        uni.showToast({
          title: res.msg || '提交失败',
          icon: 'none',
        })
      }
    })
    .catch((err) => {
      console.error('提交失败:', err)
      uni.showToast({
        title: '提交失败',
        icon: 'none',
      })
    })
}

// 与PC端保持一致的changeData方法
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

.formSubmitBtn {
  &.disabled {
    background-color: #f5f7fa;
    color: #999;
    cursor: not-allowed;
    pointer-events: none;
    border-color: #e4e7ed;
  }
}
</style>

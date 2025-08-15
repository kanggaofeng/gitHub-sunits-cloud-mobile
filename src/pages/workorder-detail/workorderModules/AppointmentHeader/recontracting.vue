<!-- components/PopupContent.vue -->
<template>
  <uni-popup ref="popup" type="bottom" border-radius="10px 10px 0 0" :mask-click="true">
    <view class="popup-container">
      <view class="popup-header">
        <text class="popup-title">改约</text>
        <text class="popup-close" @tap="handleClose">×</text>
      </view>

      <view class="form-wrapper">
        <!-- 表单使用v-bind="tablePopData"模式 -->
        <EditDialog ref="editDialogRef" v-bind="tablePopData" :model-value="formData" @update:model-value="handleModelValueChange" />
      </view>

      <view class="popup-footer">
        <button class="btn-confirm" @click="handleSubmit">提交</button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import EditDialog from '@/components/Edit-Dialog/Edit-Dialog.vue'
import { projectEditAndAddCommonFn } from '@/composables/projectEditAndAddCommon.js'
import { reAppoint } from '@/api/workOrder/nodeInfo.js'
// 获取当前实例
const { proxy } = getCurrentInstance()

const props = defineProps({
  workorder: { type: Object, default: {} },
})
// 表单引用
const editDialogRef = ref(null)
const popup = ref(null)
const emit = defineEmits(['refresh'])
// 使用tablePopData格式
// prettier-ignore
const tablePopData = ref({
	title: "用户信息",
	formItems: [
		{ field: "reasonDict", type: "select", label: "改约原因",  isRequired: '1', isHiddenForm: false, options: proxy.getAllDict('reschedule_reason') },
		{ field: "appointExpectTime", type: "datetime", label: "下次上门时间",  isRequired: '1', isHiddenForm: false },
		{
			field: "remark",
			type: "textarea",
			label: "备注",
      isRequired: '1',
			isHiddenForm: false,

			style: {
				height: '100px'
			}
		}
	]
});

const {
  updateFormItemOptions, // 更新表单项options
  updateFormItemAttribute, // 更新表单项attribute
} = projectEditAndAddCommonFn(tablePopData)

// 表单数据
const formData = ref({})

// 打开弹框
const open = () => {
  popup.value.open()
}

// 关闭弹框
const handleClose = () => {
  popup.value.close()
}

// 表单数据更新
const handleModelValueChange = (value) => {
  formData.value = value
  if (value && value.reasonDict == '-1') {
    updateFormItemAttribute('appointExpectTime', { required: false, isHiddenForm: true })
  }
}

// 提交表单
const handleSubmit = () => {
  // 使用组件内置的validate方法进行验证
  if (editDialogRef.value) {
    editDialogRef.value.EditDialogPop.validate((valid, errors) => {
      if (valid) {
        formData.value.appointStatus = 1
        formData.value.incidentId = workorderId.value
        formData.value.incActivityId = props.workorder.currentActivityId
        // 验证通过，提交表单
        uni.showLoading({
          title: '提交中...',
        })

        reAppoint(formData.value).then((res) => {
          uni.hideLoading()

          if (res.code == 200) {
            emit('refresh')
            uni.showToast({
              title: '修改成功',
              icon: 'success',
              duration: 2000,
            })
            handleClose()
          } else {
            uni.showToast({
              title: res.msg,
              icon: 'success',
              duration: 2000,
            })
          }
        })
      } else {
        // 验证失败，显示错误信息
        uni.showToast({
          title: errors.map((err) => err.message).join(', '),
          icon: 'none',
          duration: 3000,
        })
      }
    })
  }
}

const workorderId = ref('')

onLoad((options) => {
  workorderId.value = options.id
})

// 暴露方法给父组件调用
defineExpose({
  open,
})
</script>

<style lang="scss" scoped>
@import '~@/components/Edit-Dialog/compont/PageListPop/fenYePop.scss';

.form-wrapper {
  padding: 15px;
  background-color: #ffffff;
  border-radius: 6px;
  box-sizing: border-box;
}
</style>

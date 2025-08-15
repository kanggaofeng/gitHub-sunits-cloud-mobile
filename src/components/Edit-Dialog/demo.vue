<template>
  <view class="home-container">
    <view class="form-wrapper">
      <EditDialog ref="editDialogRef" v-bind="tablePopData" :model-value="formData" @update:model-value="handleModelValueChange" @item-click="handleItemClick" />
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button class="demoSubmitBtn" @tap="handleSubmit">提交</button>
    </view>
    <PageListPopDemo ref="pageListPopDemoRef" @select="selectListPop" />
  </view>
</template>

<script setup>
import EditDialog from '@/components/Edit-Dialog/Edit-Dialog.vue'
import { projectEditAndAddCommonFn } from '@/composables/projectEditAndAddCommon.js'
import PageListPopDemo from '@/components/Edit-Dialog/compont/PageListPop/PageListPopDemo.vue'
// 获取当前实例
const { proxy } = getCurrentInstance()
const {
  updateFormItemOptions, // 更新表单项options
  updateFormItemAttribute, // 更新表单项attribute
} = projectEditAndAddCommonFn()
// 表单引用
const editDialogRef = ref(null)
const pageListPopDemoRef = ref(null)

// 使用tablePopData格式
// prettier-ignore
const tablePopData = ref({
	title: "用户信息",
  formItems: [
    { field: "dianQi", type: "inputClick", label: "电器", isRequired: '1', isHiddenForm: false, labelMap: {}, otherOptions: { disabled: true }  },
		{ field: "userName", type: "input", label: "登录名", isRequired: '1', isHiddenForm: false, otherOptions: { disabled: true } },
		{ field: "nickName", type: "input", label: "姓名", isRequired: '1', isHiddenForm: false, otherOptions: { disabled: true } },
		{
			field: "shebei", type: "img", label: "设备", isRequired: '1', isHiddenForm: false, moduleName: "user",
			imgBaseInfo: { isMultiple: true, maximum: 2, isDisabled: false, moduleName: "attachment", autoUpload: true, btnShow: true, type: "img" }
		},
		{ field: "email", type: "input", label: "邮箱", isRequired: '0', isHiddenForm: false, otherOptions: { disabled: true } },
		{ field: "phonenumber", type: "input", label: "手机号码", isRequired: '1', isHiddenForm: false, otherOptions: { maxlength: 11, disabled: true } },
		{
			field: "department", type: "select", label: "部门", isRequired: '1', isHiddenForm: false,
			options: [ { label: "技术部", value: "1" }, { label: "市场部", value: "2" }, { label: "人事部", value: "3" }, { label: "财务部", value: "4" } ],
      otherOptions: { disabled: true }
		},
		{ field: "birthDate", type: "date", label: "出生日期", isRequired: '0', isHiddenForm: false, otherOptions: { disabled: true } },
		{ field: "workTime", type: "datetime", label: "上班时间", isRequired: '1', isHiddenForm: false, otherOptions: { disabled: true }  },
		{
			field: "jobStatus", type: "radio", label: "工作状态", isRequired: '1', isHiddenForm: false,
			options: [ { label: "在职", value: "1" }, { label: "离职", value: "2" }, { label: "休假", value: "3" } ],
      otherOptions: { disabled: true }
		},
		{ field: "remark", type: "textarea", label: "备注", isRequired: '0', isHiddenForm: false, otherOptions: { disabled: true } }
	]
});

// 表单数据
const formData = ref({
  dianQi: '323', // 电器字段
  userName: '23',
  nickName: 'rwe',
  email: 'wer',
  phonenumber: '34234',
  department: '2',
  birthDate: '23',
  workTime: '323',
  jobStatus: '1',
  remark: '232',
  shebei: '34', // 保留图片字段，使用逗号分隔的ID字符串
})
// 处理表单项点击
const handleItemClick = (item) => {
  // 如果点击的是电器字段，打开电器选择弹框
  if (item && item.field === 'dianQi') {
    pageListPopDemoRef.value.open(formData.value.dianQi)
  }
}

// 表单数据更新
const handleModelValueChange = (value) => {
  console.log('📢 [index.vue:174]', value)
  formData.value = value
}

// 处理待接单弹框选择
const selectListPop = (item) => {
  // 更新表单中的电器字段
  formData.value.dianQi = item.id || item.incidentId

  // 更新labelMap，用于显示选中电器的名称
  const dianQiItem = tablePopData.value.formItems.find((formItem) => formItem.field === 'dianQi')
  if (dianQiItem) {
    dianQiItem.labelMap = {
      ...dianQiItem.labelMap,
      [item.id || item.incidentId]: item.incidentCode || '工单' + (item.id || item.incidentId),
    }
  }

  console.log('选中的工单:', item.incidentCode || item.id)
}

// 提交表单
const handleSubmit = () => {
  // 使用组件内置的validate方法进行验证
  if (editDialogRef.value) {
    editDialogRef.value.EditDialogPop.validate((valid, errors) => {
      if (valid) {
        // 验证通过，提交表单
        uni.showLoading({
          title: '提交中...',
        })

        // 显示提交数据
        setTimeout(() => {
          uni.hideLoading()
          uni.showModal({
            title: '提交成功',
            content: JSON.stringify(formData.value, null, 2),
            showCancel: false,
          })
          console.log('提交的数据:', formData.value)
        }, 1500)
      }
    })
  }
}
</script>

<style scoped lang="scss">
.home-container {
  padding-bottom: 150px;
}
.form-wrapper {
  flex: 1;
  padding: 15px;
  background-color: #ffffff;
  margin: 12px 0;
  border-radius: 6px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

.submit-section {
  padding: 15px 20px 30px;
  .demoSubmitBtn {
    background-color: #3370ff;
    color: #ffffff;
    border-radius: 22px;
    height: 45px;
    line-height: 45px;
    font-size: 16px;
    font-weight: 500;
    width: 100%;
    box-shadow: 0 4px 8px rgba(51, 112, 255, 0.25);
    transition: all 0.2s ease;

    &:active {
      transform: translateY(1px);
      box-shadow: 0 2px 4px rgba(51, 112, 255, 0.2);
    }
  }
}
</style>

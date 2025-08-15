<template>
  <view class="dynamic-form">
    <div class="dynamic-info">
      <view v-for="(item, index) in formItems.filter((item) => !item.isHiddenForm)" :key="index" class="form-item">
        <!-- 标题行 -->
        <view class="form-title">
          <text v-if="isRequired(item)" class="required-star red">*</text>
          <text v-else-if="showOptionalStar" class="required-star blue">*</text>
          {{ item.label }}
          <template v-if="item.imgs && item.imgs.length">
            <text v-for="(img, index) in item.imgs" :key="index" class="preview-link" @click="handleImgClick(img.url)">[模版预览{{ item.imgs.length > 1 ? index + 1 : '' }}]</text>
          </template>
        </view>

        <!-- 输入行 -->
        <view
          class="form-input-container"
          :class="{
            'auto-height': item.type === 'img' || item.type === 'image',
            'is-disabled': item.otherOptions?.disabled,
          }"
        >
          <!-- 文本输入 -->
          <input
            v-if="item.type === 'input'"
            class="form-input"
            type="input"
            :value="modelValue[item.field]"
            :placeholder="getPlaceholder(item)"
            :disabled="item.otherOptions?.disabled"
            :readonly="item.otherOptions?.readonly"
            :maxlength="item.otherOptions?.maxlength"
            @input="(e) => handleInput(e, item.field)"
          />

          <!-- 金额输入 -->
          <MoneyInput
            v-if="item.type === 'money'"
            v-model="modelValue[item.field]"
            :placeholder="getPlaceholder(item)"
            :disabled="item.otherOptions?.disabled"
            :readonly="item.otherOptions?.readonly"
            :maxlength="item.otherOptions?.maxlength"
          />
          <!-- 数字输入 -->
          <input
            v-if="item.type === 'number'"
            class="form-input"
            type="number"
            :value="modelValue[item.field]"
            :placeholder="getPlaceholder(item)"
            :disabled="item.otherOptions?.disabled"
            :readonly="item.otherOptions?.readonly"
            :maxlength="item.otherOptions?.maxlength"
            @input="(e) => handleInput(e, item.field)"
          />

          <!-- 下拉选择器 -->
          <view v-if="item.type === 'select' || item.type === 'cascader'" class="select-container">
            <view class="select-input" @click="item.otherOptions?.disabled ? undefined : handleSelectClick(item)">
              <text v-if="modelValue[item.field]" class="select-text">{{ getSelectedLabel(item) }}</text>
              <text v-else class="select-placeholder">{{ getSelectPlaceholder(item) }}</text>
              <view class="select-arrow">
                <uni-icons type="down" size="14" color="rgb(187, 187, 187)"></uni-icons>
              </view>
            </view>
            <!-- 带系统匹配按钮的选择器 -->
            <view v-if="item.btnName" class="action-button" @click="item.otherOptions?.disabled ? undefined : handleSystemMatch(item)">
              {{ item.btnName }}
            </view>
          </view>

          <!-- 页面选择器 -->
          <view v-if="item.type === 'inputClick'" class="select-input" @click="item.otherOptions?.disabled ? undefined : handlePageSelectClick(item)">
            <text v-if="modelValue[item.field]" class="select-text">{{ getPageSelectLabel(item) }}</text>
            <text v-else class="select-placeholder">{{ getSelectPlaceholder(item) }}</text>
            <view class="select-arrow">
              <uni-icons type="down" size="14" color="rgb(187, 187, 187)"></uni-icons>
            </view>
          </view>

          <!-- 日期选择器 -->
          <DateTimePicker
            v-if="item.type === 'date' || item.type === 'datepicker'"
            v-model="modelValue[item.field]"
            mode="date"
            :disabled="item.otherOptions?.disabled"
            :placeholder="getDatePlaceholder(item)"
            :start="item.startDate || startDate"
            :end="item.endDate || endDate"
            class="date-picker"
            @change="(val) => handlePickerChange(item.field, val)"
          />

          <!-- 时间选择器 -->
          <DateTimePicker
            v-if="item.type === 'datetime'"
            v-model="modelValue[item.field]"
            mode="datetime"
            :disabled="item.otherOptions?.disabled"
            :placeholder="getTimePlaceholder(item)"
            class="date-picker"
            @change="(val) => handlePickerChange(item.field, val)"
          />

          <!-- 文本域 -->
          <textarea
            v-if="item.type === 'textarea'"
            :style="item.style"
            class="form-textarea"
            :value="modelValue[item.field]"
            :placeholder="getPlaceholder(item)"
            :disabled="item.otherOptions?.disabled"
            :readonly="item.otherOptions?.readonly"
            @input="(e) => handleInput(e, item.field)"
          ></textarea>

          <!-- 单选按钮组 -->
          <radio-group v-if="item.type === 'radio'" class="radio-group" @change="(e) => handleRadioChange(e, item.field)" :disabled="item.otherOptions?.disabled">
            <label v-for="(option, optIndex) in item.options" :key="optIndex" class="radio-item" :class="{ 'is-disabled': item.otherOptions?.disabled }">
              <radio :value="'id' in option ? option.id : option.value" :checked="modelValue[item.field] === ('id' in option ? option.id : option.value)" :disabled="item.otherOptions?.disabled" />
              <text class="radio-label" :class="{ 'is-disabled': item.otherOptions?.disabled }">{{ option.label }}</text>
            </label>
          </radio-group>

          <!-- 图片上传组件 -->
          <view v-if="item.type === 'img' || item.type === 'image'" class="img-upload-container">
            <OssFilesMultipleUpload v-model="modelValue[item.field]" :imgBaseInfo="item.imgBaseInfo" @handleSuccess="handleMultipleUploadSuccess" />
          </view>

          <!-- 富文本编辑器占位 -->
          <view v-if="item.type === 'WangEditor'" class="rich-text-container">
            <textarea class="form-textarea" :value="modelValue[item.field]" :placeholder="getPlaceholder(item)" @input="(e) => handleInput(e, item.field)"></textarea>
          </view>
        </view>
      </view>
    </div>

    <!-- 选择器组件 -->
    <lb-picker ref="selectPicker" mode="selector" :props="pickerProps" :list="currentOptions" @confirm="handleSelectorConfirm"></lb-picker>
  </view>
</template>

<script setup>
import DateTimePicker from './compont/DateTimePicker.vue'
import OssFilesMultipleUpload from '@/components/OssFileUpload/OssFilesMultipleUpload.vue'
import { createPickerProps } from '@/components/Edit-Dialog/compont/picker-helper'
import MoneyInput from './compont/MoneyInput.vue'

const props = defineProps({
  // 支持v-bind="tablePopData"方式绑定
  formItems: {
    type: Array,
    default: () => [],
  },
  // 支持v-model方式绑定
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  showOptionalStar: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['item-click', 'update:modelValue', 'xiTongPipeiEv', 'confirm', 'validate-error'])

const isRequired = (item) => {
  return item.isRequired === '1' || item.isRequired === 1 || item.isRequired === true
}

// 对外暴露EditDialogPop对象，用于表单验证
const EditDialogPop = ref({
  validateMessage: {},
  validate(callback) {
    // 简单的表单验证逻辑，使用isRequired判断必填项
    const errors = []
    const formItems = props.formItems || []

    // 遍历所有表单项，找到第一个错误
    for (const item of formItems) {
      if (!item.isHiddenForm && isRequired(item)) {
        const field = item.field
        const value = props.modelValue[field]

        // 简单判断值是否为空
        if (!value || value.toString().trim() === '' || (Array.isArray(value) && value.length === 0)) {
          const error = {
            field,
            message: `请${
              item.type === 'select' || item.type === 'cascader' || item.type === 'date' || item.type === 'datepicker' || item.type === 'datetime'
                ? '选择'
                : item.type === 'img' || item.type === 'image'
                  ? '上传'
                  : '填写'
            }${item.label}`,
          }
          errors.push(error)
          // 找到第一个错误就提示并退出循环
          uni.showToast({
            title: error.message,
            icon: 'none',
            duration: 3000,
          })
          break
        }
      }
    }

    const isValid = errors.length === 0
    if (callback) {
      callback(isValid, errors)
    }
    return isValid
  },
})

// Picker ref
const selectPicker = ref(null)

// 计算属性：根据当前选项列表动态生成pickerProps
const pickerProps = computed(() => {
  return createPickerProps(currentOptions.value)
})

// Current form item and options
const currentItem = ref(null)
const currentField = ref('')
const currentOptions = ref([])

// Date range
const startDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 10)
  return formatDate(date)
})

const endDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 10)
  return formatDate(date)
})

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Handle input changes
const handleInput = (e, field) => {
  const updatedData = {
    ...props.modelValue,
    [field]: e.detail.value,
  }

  emit('update:modelValue', updatedData)
}

// Handle radio changes
const handleRadioChange = (e, field) => {
  const updatedData = {
    ...props.modelValue,
    [field]: e.detail.value,
  }

  emit('update:modelValue', updatedData)
}

// Handle picker changes (date/time)
const handlePickerChange = (field, value) => {
  const updatedData = {
    ...props.modelValue,
    [field]: value,
  }

  emit('update:modelValue', updatedData)
}

// Handle select click
const handleSelectClick = (item) => {
  currentItem.value = item
  currentField.value = item.field
  currentOptions.value = item.options || []
  selectPicker.value.show()
}

// Handle page select click (for inputClick type)
const handlePageSelectClick = (item) => {
  // 触发父组件的item-click事件，让父组件处理弹窗
  emit('item-click', item)
  // 同时更新formData，以便父组件获取到当前字段
  const updatedData = {
    ...props.modelValue,
    [item.field]: props.modelValue[item.field],
  }
  emit('update:modelValue', updatedData)
}

// 处理系统匹配按钮点击
const handleSystemMatch = (item) => {
  // 触发系统匹配事件
  emit('xiTongPipeiEv', item.field)
}

// Handle select confirm
const handleSelectorConfirm = (e) => {
  // 获取当前选项列表的第一个选项，判断是使用value还是id作为值
  const valueKey = currentOptions.value.length > 0 && 'id' in currentOptions.value[0] ? 'id' : 'value'

  const updatedData = {
    ...props.modelValue,
    [currentField.value]: e.item[valueKey],
  }

  console.log('📢 [Edit-Dialog.vue:290]', updatedData)
  emit('update:modelValue', updatedData)
}

// 处理多图上传成功回调
const handleMultipleUploadSuccess = (files) => {
  console.log('上传成功的文件列表:', files)
  // 组件已经自动更新了formData的值，不需要额外操作
}

// Helper functions
const getSelectedLabel = (item) => {
  const selectedValue = props.modelValue[item.field]
  // 将当前值转换为字符串进行比较
  const stringValue = selectedValue !== undefined && selectedValue !== null ? String(selectedValue) : ''
  const valueKey = 'id' in (item.options?.[0] || {}) ? 'id' : 'value'

  // 比较时统一使用字符串
  const selectedOption = item.options?.find((option) => {
    const optionValue = option[valueKey]
    return optionValue !== undefined && optionValue !== null ? String(optionValue) === stringValue : false
  })

  return selectedOption ? selectedOption.label : stringValue
}

const getPlaceholder = (item) => {
  return isRequired(item) ? `请输入${item.label}` : `${item.label}(选填)`
}

const getSelectPlaceholder = (item) => {
  return isRequired(item) ? `请选择${item.label}` : `${item.label}(选填)`
}

const getDatePlaceholder = (item) => {
  return isRequired(item) ? `请选择${item.label}` : `${item.label}(选填)`
}

const getTimePlaceholder = (item) => {
  return isRequired(item) ? `请选择${item.label}` : `${item.label}(选填)`
}

// Helper function for inputClick
const getPageSelectLabel = (item) => {
  const selectedValue = props.modelValue[item.field]
  // 这里可以根据实际情况获取显示的文本
  // 可以用item.labelMap存储id到label的映射
  if (item.labelMap && item.labelMap[selectedValue]) {
    return item.labelMap[selectedValue]
  }
  return selectedValue ? `${selectedValue}` : ''
}

// 添加表单提交方法
const submit = () => {
  const isValid = EditDialogPop.value.validate((valid, errors) => {
    if (valid) {
      // 触发confirm事件
      emit('confirm', props.modelValue)
    }
  })
  return isValid
}

// 添加单独的validate方法直接暴露
const validate = () => {
  return new Promise((resolve, reject) => {
    const isValid = EditDialogPop.value.validate((valid, errors) => {
      if (!valid && errors && errors.length > 0) {
        reject(errors[0])
      } else {
        resolve(true)
      }
    })
  })
}

const dialogVisible = ref(false)
const dialogImageUrl = ref(null)

const handleImgClick = (img) => {
  dialogImageUrl.value = img
  dialogVisible.value = true
  // 使用 uni-app 的预览图片功能
  uni.previewImage({
    urls: [img],
    current: img,
  })
}

defineExpose({
  EditDialogPop,
  validate,
  submit,
})
</script>

<style scoped lang="scss">
@import './compont/Edit-Dialog.scss';

.action-button {
  &.is-disabled {
    background-color: #f5f7fa;
    color: #999;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.upload-preview-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-item {
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s;

  &:active {
    background-color: #e6f1fc;
  }
}

.preview-text {
  margin-top: 8px;
  font-size: 12px;
  color: #409eff;
  font-weight: 500;
}

.preview-link {
  color: #409eff;
  font-size: 14px;
  margin-left: 8px;
}
.dynamic-info {
  padding: 10px 0;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>

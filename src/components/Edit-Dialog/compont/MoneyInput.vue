<template>
  <input class="form-input" type="digit" :value="modelValue" :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :maxlength="maxlength" @input="onInput" @blur="onBlur" />
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  maxlength: {
    type: [String, Number],
    default: undefined,
  },
})

const emit = defineEmits(['update:modelValue', 'input', 'blur'])

const onInput = (e) => {
  let value = e.detail.value
  // 允许输入负号、数字和小数点
  value = value.replace(/[^\d.-]/g, '')
  // 负号只能在开头
  if (value.indexOf('-') > 0) {
    value = value.replace(/-/g, '')
  }
  // 限制小数点数量
  const dotCount = (value.match(/\./g) || []).length
  if (dotCount > 1) {
    const parts = value.split('.')
    value = parts[0] + '.' + parts.slice(1).join('')
  }
  // 限制小数位数最多4位
  if (value.includes('.')) {
    const parts = value.split('.')
    if (parts[1].length > 4) {
      value = parts[0] + '.' + parts[1].substring(0, 4)
    }
  }
  emit('update:modelValue', value)
  emit('input', e)
}

const onBlur = (e) => {
  let value = e.detail.value
  if (!value || value === '-' || value === '.') {
    emit('update:modelValue', '')
    emit('blur', e)
    return
  }
  const numValue = parseFloat(value)
  if (numValue === 0) {
    uni.showToast({
      title: '金额不能为0',
      icon: 'none',
      duration: 2000,
    })
    emit('update:modelValue', '')
    emit('blur', e)
    return
  }
  if (isNaN(numValue)) {
    emit('update:modelValue', '')
    emit('blur', e)
    return
  }
  const formattedValue = numValue.toFixed(2)
  emit('update:modelValue', formattedValue)
  emit('blur', e)
}
</script>

<style scoped>
.form-input {
  flex: 1;
  font-size: 14px;
  min-height: 40px;
  line-height: 40px;
  width: 100%;
  background-color: transparent;
  padding: 0 12px;
  box-sizing: border-box;
}
</style>

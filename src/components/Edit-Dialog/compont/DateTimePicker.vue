<template>
  <!-- Date Picker -->
  <picker v-if="mode === 'date'" mode="date" :value="modelValue" :start="start" :end="end" :disabled="disabled" @change="handleChange">
    <view class="picker-content" :class="{ 'picker-disabled': disabled }">
      <slot>
        <text v-if="modelValue" class="picker-text">{{ modelValue }}</text>
        <text v-else class="picker-placeholder">{{ placeholder }}</text>
      </slot>
      <view class="picker-arrow">
        <text class="arrow-icon">📅</text>
      </view>
    </view>
  </picker>

  <!-- DateTime Picker (Year-Month-Day Hour:Minute:Second) -->
  <picker v-else-if="mode === 'datetime'" mode="multiSelector" :value="multiIndex" :range="multiArray" :disabled="disabled" @change="handleDateTimeChange" @columnchange="bindMultiPickerColumnChange">
    <view class="picker-content" :class="{ 'picker-disabled': disabled }">
      <slot>
        <text v-if="modelValue" class="picker-text">{{ formatDateTimeDisplay(modelValue) }}</text>
        <text v-else class="picker-placeholder">{{ placeholder }}</text>
      </slot>
      <view class="picker-arrow">
        <text class="arrow-icon">🕒</text>
      </view>
    </view>
  </picker>
</template>

<script setup>
const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => ['date', 'datetime'].includes(value),
  },
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  start: {
    type: String,
    default: '',
  },
  end: {
    type: String,
    default: '',
  },
  format: {
    type: String,
    default: 'YYYY-MM-DD HH:mm:ss',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

// For datetime picker
const multiIndex = ref([0, 0, 0, 0, 0, 0])
const multiArray = ref([[], [], [], [], [], []])

// Format datetime for display
const formatDateTimeDisplay = (datetime) => {
  if (!datetime) return ''
  return datetime.replace(' ', ' ') // 可以根据需要调整显示格式
}

// Initialize datetime picker ranges
const initDateTimeRanges = () => {
  const now = new Date()
  const currentYear = now.getFullYear()

  // Years (current year ±10)
  const years = []
  for (let i = currentYear - 10; i <= currentYear + 10; i++) {
    years.push(i)
  }

  // Months (1-12)
  const months = []
  for (let i = 1; i <= 12; i++) {
    months.push(i.toString().padStart(2, '0'))
  }

  // Days (1-31)
  const days = []
  const daysInMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate()
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i.toString().padStart(2, '0'))
  }

  // Hours (0-23)
  const hours = []
  for (let i = 0; i < 24; i++) {
    hours.push(i.toString().padStart(2, '0'))
  }

  // Minutes (0-59)
  const minutes = []
  for (let i = 0; i < 60; i++) {
    minutes.push(i.toString().padStart(2, '0'))
  }

  // Seconds (0-59)
  const seconds = []
  for (let i = 0; i < 60; i++) {
    seconds.push(i.toString().padStart(2, '0'))
  }

  multiArray.value = [years, months, days, hours, minutes, seconds]

  // Set default to current time
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0')
  const currentDay = now.getDate().toString().padStart(2, '0')
  const currentHour = now.getHours().toString().padStart(2, '0')
  const currentMinute = now.getMinutes().toString().padStart(2, '0')
  const currentSecond = now.getSeconds().toString().padStart(2, '0')

  multiIndex.value = [years.indexOf(currentYear), months.indexOf(currentMonth), days.indexOf(currentDay), hours.indexOf(currentHour), minutes.indexOf(currentMinute), seconds.indexOf(currentSecond)]

  // Set default value if not provided
  if (!props.modelValue) {
    const defaultDateTime = `${currentYear}-${currentMonth}-${currentDay} ${currentHour}:${currentMinute}:${currentSecond}`
    // emit('update:modelValue', defaultDateTime)
  } else {
    // Sync with existing value
    syncPickerWithValue()
  }
}

// Sync picker with existing value
const syncPickerWithValue = () => {
  if (!props.modelValue) return

  try {
    const dt = new Date(props.modelValue.replace(/-/g, '/'))
    const year = dt.getFullYear()
    const month = (dt.getMonth() + 1).toString().padStart(2, '0')
    const day = dt.getDate().toString().padStart(2, '0')
    const hour = dt.getHours().toString().padStart(2, '0')
    const minute = dt.getMinutes().toString().padStart(2, '0')
    const second = dt.getSeconds().toString().padStart(2, '0')

    // Update days array based on selected year/month
    const daysInMonth = new Date(year, month, 0).getDate()
    const days = []
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i.toString().padStart(2, '0'))
    }
    multiArray.value[2] = days

    multiIndex.value = [
      multiArray.value[0].indexOf(year),
      multiArray.value[1].indexOf(month),
      multiArray.value[2].indexOf(day),
      multiArray.value[3].indexOf(hour),
      multiArray.value[4].indexOf(minute),
      multiArray.value[5].indexOf(second),
    ]
  } catch (e) {
    console.error('Error parsing datetime value:', e)
  }
}

// Handle datetime column change
const bindMultiPickerColumnChange = (e) => {
  const column = e.detail.column
  const value = e.detail.value

  // Update days when year or month changes
  if (column === 0 || column === 1) {
    const year = multiArray.value[0][multiIndex.value[0]]
    const month = multiArray.value[1][multiIndex.value[1]]
    const daysInMonth = new Date(year, month, 0).getDate()

    // Update days array
    const days = []
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i.toString().padStart(2, '0'))
    }

    multiArray.value[2] = days

    // Adjust day index if current day > days in month
    if (multiIndex.value[2] >= daysInMonth) {
      multiIndex.value[2] = daysInMonth - 1
    }
  }

  multiIndex.value[column] = value
}

// Handle datetime change
const handleDateTimeChange = (e) => {
  const values = e.detail.value
  const datetimeStr = `${multiArray.value[0][values[0]]}-${multiArray.value[1][values[1]]}-${multiArray.value[2][values[2]]} ${multiArray.value[3][values[3]]}:${
    multiArray.value[4][values[4]]
  }:${multiArray.value[5][values[5]]}`

  emit('update:modelValue', datetimeStr)
  emit('change', datetimeStr)
}

// Handle date change
const handleChange = (e) => {
  emit('update:modelValue', e.detail.value)
  emit('change', e.detail.value)
}

// Watch for external value changes
watch(
  () => props.modelValue,
  (newVal) => {
    if (props.mode === 'datetime' && newVal) {
      syncPickerWithValue()
    }
  },
)

// Initialize on mount
onMounted(() => {
  if (props.mode === 'datetime') {
    initDateTimeRanges()
  }
})
</script>

<style lang="scss" scoped>
.picker-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.picker-text {
  font-size: 14px;
  color: #333;
}

.picker-placeholder {
  font-size: 14px;
  color: #999;
}

.picker-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.arrow-icon {
  font-size: 14px;
  color: #999;
}

/* 禁用状态样式 */
.picker-disabled {
  .picker-text {
    color: #999 !important;
  }

  .picker-placeholder {
    color: #999 !important;
  }

  .arrow-icon {
    opacity: 0.5;
  }
}
</style>

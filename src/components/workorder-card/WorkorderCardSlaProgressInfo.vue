<template>
  <view class="countdown" @click.stop="handleClick">
    <view class="progress-header">
      <view class="sla-item">
        <view class="icon-container">
          <DsSvgIcon icon="icon-shixiao" :class="getColorClass(progressItem.examineState, progressItem.izOverDue)" />
        </view>
        <Tooltip :content="progressItem.slaIndicatorName" position="top">
          <div class="progress-title">{{ progressItem.slaIndicatorName }}</div>
        </Tooltip>
      </view>
      <view class="status-text" v-if="shouldShowTags">
        <text v-if="progressItem.examineState === '0'" class="color-primary">未开始</text>
        <text v-if="progressItem.examineState === '2'" class="color-success">已完成</text>
        <text v-if="progressItem.examineState === '2' && progressItem.izOverDue === '1'" class="color-error" style="margin-left: 5px">已超期</text>
      </view>
      <view class="time-info" v-if="hasCountdown">
        <text :class="progressItem.izOverDue === '1' ? 'color-error' : 'color-primary'">{{ progressItem.izOverDue === '1' ? '已超期 ' : '剩余 ' }}{{ getTimeText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import Tooltip from '@/components/Tooltip/Tooltip.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
// 引入时间格式化工具函数
import { parseDate, formatCountdown, formatDuration } from '@/pages/workorder-detail/workorderModules/SlaProgressInfo/timeFormatter.js'

/**
 * SLA进度信息组件
 * 定义 props 接收SLA进度项数据
 * progressItem包含：
 * - slaTypeName: SLA类型名称
 * - slaIndicatorName: SLA指标名称
 * - examineState: 审核状态（0-未开始，1-进行中，2-已结束）
 * - izOverDue: 是否超期（0-正常，1-超期）
 * - startTime: 计划开始时间
 * - endTime: 计划结束时间
 * - factStartTime: 实际开始时间
 * - factEndTime: 实际结束时间
 * - progress: 进度百分比
 * - color: 进度条颜色
 */

// 定义 props 接收截止时间
const props = defineProps({
  progressItem: {
    type: Object,
  },
})

// 定义自定义事件
const emit = defineEmits(['refresh'])

// 定时器引用，用于组件卸载时清除
let timer = null

// 响应式数据
const currentTime = ref(new Date()) // 当前时间
const remainingDuration = ref('') // 剩余时间或超期时间
const totalDuration = ref('') // 总用时

// 处理点击事件
const handleClick = () => {
  emit('refresh')
}

// 计算属性：是否有倒计时
const hasCountdown = computed(() => {
  return props.progressItem.examineState === '1' && !props.progressItem.factEndTime
})

// 计算属性：是否显示标签
const shouldShowTags = computed(() => {
  return !hasCountdown.value
})

// 根据状态获取颜色类
const getColorClass = (examineState, izOverDue) => {
  if (examineState === '0') return 'color-primary' // 未开始 - 蓝色
  if (examineState === '1') {
    return izOverDue === '1' ? 'color-error' : 'color-primary' // 进行中 - 超期红色，正常蓝色
  }
  if (examineState === '2') {
    return izOverDue === '1' ? 'color-error' : 'color-success' // 已完成 - 超期红色，正常绿色
  }
  return 'color-default'
}

// 获取格式化的时间文本
const getTimeText = computed(() => {
  return remainingDuration.value
})

/**
 * 计算并更新各种时间状态
 * 根据当前时间、计划时间和实际时间计算SLA进度和剩余时间
 */
const updateTimeStatus = () => {
  // 获取当前时间
  const now = new Date()
  // 解析计划结束时间
  const endTimeDate = parseDate(props.progressItem.endTime)
  // 解析计划开始时间
  const startTimeDate = parseDate(props.progressItem.startTime)
  // 解析实际开始时间
  const factStartTimeDate = parseDate(props.progressItem.factStartTime)
  // 解析实际结束时间
  const factEndTimeDate = parseDate(props.progressItem.factEndTime)

  // 更新当前时间响应式变量
  currentTime.value = now

  // 初始化状态：如果已开始但状态仍为未开始，则更新为进行中
  if (factStartTimeDate && props.progressItem.examineState === '0') {
    props.progressItem.examineState = '1'
  }

  // 判断节点是否已完成
  if (factEndTimeDate) {
    // 已完成状态
    props.progressItem.examineState = '2'

    // 判断是否超期完成
    if (endTimeDate && factEndTimeDate > endTimeDate) {
      props.progressItem.izOverDue = '1'
    } else {
      props.progressItem.izOverDue = '0'
    }

    // 计算总用时
    if (factStartTimeDate) {
      const usedSeconds = Math.floor((factEndTimeDate - factStartTimeDate) / 1000)
      totalDuration.value = formatDuration(usedSeconds)
    }

    // 计算进度百分比
    if (startTimeDate && endTimeDate) {
      const totalTime = endTimeDate - startTimeDate
      const usedTime = factEndTimeDate - factStartTimeDate
      props.progressItem.progress = Math.min(100, Math.max(0, (usedTime / totalTime) * 100))
    }
  } else if (factStartTimeDate) {
    // 进行中状态
    props.progressItem.examineState = '1'

    // 如果存在计划结束时间
    if (endTimeDate) {
      // 计算与计划结束时间的差值
      const diff = endTimeDate - now

      if (diff > 0) {
        // 正常进行中：未超期
        props.progressItem.izOverDue = '0'
        // 格式化剩余时间
        remainingDuration.value = formatDuration(Math.floor(diff / 1000))
      } else {
        // 超期进行中
        props.progressItem.izOverDue = '1'
        // 实时计算超期时间并格式化
        const overdueSeconds = Math.floor((now - endTimeDate) / 1000)
        remainingDuration.value = formatDuration(overdueSeconds)
      }

      // 计算进度百分比
      if (startTimeDate) {
        const totalTime = endTimeDate - startTimeDate
        const usedTime = now - factStartTimeDate
        props.progressItem.progress = Math.min(100, Math.max(0, (usedTime / totalTime) * 100))
      }
    }
  }
}

// 组件挂载时启动定时器，每秒更新一次时间状态
onMounted(() => {
  updateTimeStatus()
  timer = setInterval(updateTimeStatus, 1000)
})

// 组件卸载时清除定时器，防止内存泄漏
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style lang="scss" scoped>
.countdown {
  font-size: 12px;
  color: #000818;
  margin-bottom: 5px;
}

.progress-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.progress-title {
  font-weight: 400;
  font-size: 12px;
  color: #566070;
  margin-left: 5px;
  color: #191919;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.status-text {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 12px;
  margin-left: 5px;
}

.time-info {
  font-size: 12px;
  margin-left: 5px;
}

.sla-item {
  display: flex;
  align-items: center;
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.color-primary {
  color: #409eff !important;
}

.color-info {
  color: #909399 !important;
}

.color-success {
  color: #67c23a !important;
}

.color-error {
  color: #f56c6c !important;
}

.icon-shixiao {
  font-size: 16px;
}
</style>

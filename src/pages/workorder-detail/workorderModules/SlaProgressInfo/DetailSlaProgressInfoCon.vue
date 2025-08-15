<template>
  <!-- SLA进度信息组件 - 支持5种状态显示 -->
  <view class="sla-progress-container">
    <view class="header-row">
      <view class="title-status-container">
        <!-- 使用Tooltip组件显示完整的SLA指标名称 -->
        <Tooltip :content="props.progressItem.slaIndicatorName" position="right">
          <div class="sla-title" :style="{ maxWidth: props.progressItem.izOverDue === '1' ? '100px' : 'auto' }">
            {{ props.progressItem.slaIndicatorName }}
          </div>
        </Tooltip>

        <!-- 审核状态标签：未开始、进行中、已结束 -->
        <view class="shengHeStatus" :class="shengHeStatusInfo.class">
          {{ shengHeStatusInfo.text }}
        </view>
        <!-- 是否超期标签：正常、超期 -->
        <view v-if="props.progressItem.izOverDue === '1'" class="status-overdue">超期</view>
      </view>
      <!-- 时间显示在最右侧：根据状态显示剩余时间、超期时间或总用时 -->
      <view v-if="timeStatusInfo.shouldShow" :class="timeStatusInfo.class" v-html="timeStatusInfo.text"></view>
    </view>

    <!-- 进度条 - 只在非未开始状态显示 -->
    <view v-if="props.progressItem.examineState !== '0'" class="progress-container">
      <view class="progress-background">
        <!-- 根据状态和是否超期动态设置进度条样式 -->
        <view class="progress-bar" :style="getProgressBarStyle()"></view>
      </view>
    </view>

    <!-- 未开始状态显示 -->
    <view v-if="props.progressItem.examineState === '0'" class="not-started-container">
      <view class="not-started-progress">
        <view class="not-started-bar"></view>
      </view>
    </view>

    <!-- 时间信息行 -->
    <view class="time-info-row">
      <view class="time-row">
        <!-- 时间点标识 -->
        <view class="dot">●</view>
        <!-- 显示时效信息 -->
        <text class="time-label">时效：</text>
        <text class="time-duration">{{ formatTimeDisplay(props.progressItem.timeValue) }}</text>
        <!-- 根据状态显示截止时间或完成时间 -->
        <text v-if="props.progressItem.endTime && props.progressItem.examineState !== '2'" class="time-deadline">
          <text class="separator">|</text>
          请在{{ formatDeadline(props.progressItem.endTime) }}前完成
        </text>
        <text v-if="props.progressItem.endTime && props.progressItem.examineState === '2'" class="time-deadline">
          <text class="separator">|</text>
          {{ formatCompletedTime(props.progressItem.startTime, props.progressItem.endTime) }}
        </text>
      </view>
      <!-- 已完成超期状态显示超期时间 -->
      <view v-if="props.progressItem.examineState === '2' && props.progressItem.izOverDue === '1'" class="overdue-row">
        <view class="dot overdue-dot">●</view>
        <text class="overdue-text">超期：{{ getOverdueDuration() }}</text>
      </view>
    </view>

    <!-- 分割线 - 最后一个SLA不显示 -->
    <view v-if="!props.isLast" class="divider"></view>
  </view>
</template>

<script setup>
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

import { ref, computed, onMounted, onUnmounted } from 'vue'
import Tooltip from '@/components/Tooltip/Tooltip.vue'
// 引入时间格式化工具函数
import { parseDate, formatTimeDisplay, formatDeadline, formatCompletedTime, formatCountdown, formatDuration } from './timeFormatter.js'

// 定义组件接收的props
const props = defineProps({
  // SLA进度项数据
  progressItem: {
    type: Object,
    required: true,
  },
  // 是否为最后一个SLA项，用于控制分割线显示
  isLast: {
    type: Boolean,
    default: false,
  },
})

// 定时器引用，用于组件卸载时清除
let timer = null

// 响应式数据
const currentTime = ref(new Date()) // 当前时间
const totalDuration = ref('') // 总用时
const remainingDuration = ref('') // 剩余时间或超期时间

// 合并的审核状态方法
const shengHeStatusInfo = computed(() => {
  const state = props.progressItem.examineState

  switch (state) {
    case '1':
      return {
        text: '进行中',
        class: 'status-in-progress',
      }
    case '2':
      return {
        text: '已完成',
        class: 'status-completed',
      }
    case '0':
    default:
      return {
        text: '未开始',
        class: 'status-not-started',
      }
  }
})

// 合并的时间状态方法
const timeStatusInfo = computed(() => {
  const state = props.progressItem.examineState
  const overdue = props.progressItem.izOverDue

  // 判断是否应该显示时间状态
  const shouldShow = state === '2' || state === '1'

  // 如果不应该显示，直接返回
  if (!shouldShow) {
    return {
      shouldShow: false,
      class: '',
      text: '',
    }
  }

  // 确定样式类
  let className = ''
  if (state === '2') {
    // 已完成：绿色或红色
    className = overdue === '1' ? 'time-overdue' : 'time-completed'
  } else if (state === '1') {
    // 进行中：蓝色或红色
    className = overdue === '1' ? 'time-overdue' : 'time-remaining'
  } else {
    className = 'time-default'
  }

  // 确定显示文本
  let text = ''
  if (state === '2') {
    // 已完成状态显示总用时
    text = `总用时：${totalDuration.value}`
  } else if (state === '1') {
    // 进行中状态
    if (overdue === '1') {
      text = `已超期 ${remainingDuration.value}`
    } else {
      text = `剩余 ${remainingDuration.value}`
    }
  }

  return {
    shouldShow: true,
    class: className,
    text: text,
  }
})

/**
 * 获取进度条样式
 * @returns {object} 包含样式属性的对象
 */
const getProgressBarStyle = () => {
  const state = props.progressItem.examineState
  const overdue = props.progressItem.izOverDue
  const progress = Math.min(100, Math.max(0, props.progressItem.progress || 0))

  let backgroundColor = '#3AA4EC' // 正常进行中状态

  if (state === '2') {
    // 已完成状态
    backgroundColor = overdue === '1' ? '#F1344E' : '#00AB6A'
  } else if (state === '1' && overdue === '1') {
    // 进行中超期状态
    backgroundColor = '#F1344E'
  }

  return {
    width: `${progress}%`,
    backgroundColor,
    height: '6px',
    borderRadius: '4px',
  }
}

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
        remainingDuration.value = formatCountdown(Math.floor(diff / 1000))
      } else {
        // 超期进行中
        props.progressItem.izOverDue = '1'
        // 实时计算超期时间并格式化
        const overdueSeconds = Math.floor((now - endTimeDate) / 1000)
        remainingDuration.value = formatCountdown(overdueSeconds)
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

/**
 * 获取超期时间
 * @returns {string} 格式化后的超期时间
 */
const getOverdueDuration = () => {
  // 获取节点的计划结束时间
  const endTimeDate = parseDate(props.progressItem.endTime)
  // 获取节点的实际结束时间
  const factEndTimeDate = parseDate(props.progressItem.factEndTime)
  // 获取节点的实际开始时间
  const factStartTimeDate = parseDate(props.progressItem.factStartTime)
  // 获取当前时间
  const now = new Date()

  // 已完成超期：如果节点有计划结束时间和实际结束时间，并且实际结束时间晚于计划结束时间
  if (endTimeDate && factEndTimeDate && factEndTimeDate > endTimeDate) {
    // 计算超期秒数：(实际结束时间 - 计划结束时间) / 1000
    const overdueSeconds = Math.floor((factEndTimeDate - endTimeDate) / 1000)
    // 使用 formatCountdown 函数格式化超期时间并返回
    return formatDuration(overdueSeconds)
  }

  // 进行中超期：如果节点有计划结束时间和实际开始时间，并且当前时间已经超过了计划结束时间
  if (endTimeDate && factStartTimeDate && now > endTimeDate) {
    // 计算超期秒数：(当前时间 - 计划结束时间) / 1000
    const overdueSeconds = Math.floor((now - endTimeDate) / 1000)
    // 使用 formatDuration 函数格式化超期时间并返回
    return formatCountdown(overdueSeconds)
  }

  // 如果不满足以上条件（未超期或数据不完整），则返回空字符串
  return ''
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
.sla-progress-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 标题和状态行 */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-status-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.sla-title {
  font-weight: 500;
  font-size: 14px;
  color: #191919;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
  cursor: pointer;
}

/* 状态文本样式 */
.status-completed {
  background: #dbfbef;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
  color: #00ab6a;
  padding: 2px 6px;
  line-height: 16px; /* 关键：让文字行高 = 容器高度 */
  display: flex;
  align-items: center;
}

.status-in-progress {
  background: #e4f4ff;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
  color: #1f99ec;
  padding: 2px 6px;
  display: flex;
  align-items: center;
  line-height: 16px; /* 关键：让文字行高 = 容器高度 */
}

.status-overdue {
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
  color: #ffffff;
  background: #f2344e;
  padding: 2px 6px;
  display: flex;
  align-items: center;
  line-height: 16px; /* 关键：让文字行高 = 容器高度 */
}

.status-not-started {
  background: #f5f5f5;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
  color: #8f959e;
  padding: 2px 6px;
  line-height: 16px; /* 关键：让文字行高 = 容器高度 */
  display: flex;
  align-items: center;
}

/* 进度条容器 */
.progress-container {
  margin: 5px 0;
}

.progress-background {
  width: 100%;
  height: 6px;
  background: #f7f8fa;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.3s ease;
}

/* 未开始状态进度条 */
.not-started-container {
  margin: 5px 0;
}

.not-started-progress {
  width: 100%;
  height: 6px;
  background: #f2f3f5;
  border-radius: 4px;
  overflow: hidden;
}

.not-started-bar {
  width: 0%;
  height: 100%;
  background: #e5e6eb;
  border-radius: 4px;
}

/* 时间信息行 */
.time-info-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  color: #4e5969;
  font-size: 8px;
}

.time-label {
  font-weight: 400;
  font-size: 12px;
  color: #4e5969;
}

.time-duration {
  font-weight: 400;
  font-size: 12px;
  color: #4e5969;
}

.time-deadline {
  font-weight: 400;
  font-size: 12px;
  color: #4e5969;
}

.separator {
  opacity: 0.46;
  margin: 0 5px;
  border-radius: 4px;
}

/* 超期行样式 */
.overdue-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.overdue-dot {
  color: #f1344e;
  font-size: 8px;
}

.overdue-text {
  font-weight: 400;
  font-size: 12px;
  color: #f1344e;
}

/* 时间状态样式 */
.time-status {
  margin-left: 16px; /* 对齐点号 */
}

.time-completed {
  font-weight: 400;
  font-size: 12px;
  color: #00ab6a;
}

.time-overdue {
  font-weight: 400;
  font-size: 12px;
  color: #f1344e;
  ::v-deep .slaStatus {
    background: #ffeaee;
    border-radius: 4px;
    padding: 2px 3px;
  }
}

.time-remaining {
  font-weight: 400;
  font-size: 12px;
  color: #3aa4ec;
  ::v-deep .slaStatus {
    background: #e4f4ff;
    border-radius: 4px;
    padding: 2px 3px;
  }
}

.time-default {
  font-weight: 400;
  font-size: 12px;
  color: #4e5969;
}

/* 分割线 */
.divider {
  height: 1px;
  background: repeating-linear-gradient(to right, #dfdfdf 0, #dfdfdf 2px, transparent 2px, transparent 6px);
  margin-top: 10px;
}
</style>

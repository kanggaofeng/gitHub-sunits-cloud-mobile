<template>
  <view class="tooltip-container" @mouseenter="showTooltip" @mouseleave="hideTooltip" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
    <slot></slot>
    <view v-if="isVisible" class="tooltip-content" :style="tooltipStyle">
      {{ content }}
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: 'top', // top, bottom, left, right
  },
})

const isVisible = ref(false)
const tooltipStyle = computed(() => {
  const baseStyle = {
    position: 'absolute',
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  }

  switch (props.position) {
    case 'top':
      return {
        ...baseStyle,
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '4px',
      }
    case 'bottom':
      return {
        ...baseStyle,
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: '4px',
      }
    case 'left':
      return {
        ...baseStyle,
        right: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginRight: '4px',
      }
    case 'right':
      return {
        ...baseStyle,
        left: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginLeft: '4px',
      }
    default:
      return baseStyle
  }
})

let touchTimer = null

const showTooltip = () => {
  isVisible.value = true
}

const hideTooltip = () => {
  isVisible.value = false
}

const handleTouchStart = () => {
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }
  showTooltip()
}

const handleTouchEnd = () => {
  touchTimer = setTimeout(() => {
    hideTooltip()
  }, 2000) // 2秒后自动隐藏
}
</script>

<style lang="scss" scoped>
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-content {
  &::before {
    content: '';
    position: absolute;
    border: 4px solid transparent;
  }
}

.tooltip-content[style*='bottom: 100%']::before {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: rgba(0, 0, 0, 0.8);
}

.tooltip-content[style*='top: 100%']::before {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: rgba(0, 0, 0, 0.8);
}

.tooltip-content[style*='right: 100%']::before {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: rgba(0, 0, 0, 0.8);
}

.tooltip-content[style*='left: 100%']::before {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: rgba(0, 0, 0, 0.8);
}
</style>

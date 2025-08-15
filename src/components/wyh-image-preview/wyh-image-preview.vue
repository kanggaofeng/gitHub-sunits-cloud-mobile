<template>
  <view class="image-preview">
    <!-- 顶部操作栏 -->
    <view class="status-bar"></view>
    <view class="top-bar">
      <view class="page-indicator">{{ currentIndex + 1 }} / {{ images.length }}</view>
      <view class="top-actions">
        <view class="action-btn" @click="downloadImage">
          <image src="/static/images/wyh-image-preview/download.svg" mode="aspect-fit" class="action-icon"></image>
        </view>
        <view class="action-btn close-btn" @click="closePreview">
          <image src="/static/images/wyh-image-preview/close.svg" mode="aspect-fit" class="action-icon"></image>
        </view>
      </view>
    </view>

    <!-- 图片展示区域 -->
    <swiper :current="currentIndex" @change="onSwiperChange" circular class="image-swiper" :indicator-dots="false" :autoplay="false">
      <swiper-item v-for="(image, index) in images" :key="index">
        <view class="image-container" @click="handleImageClick">
          <image
            :src="image"
            mode="aspect-fit"
            :style="getImageStyle(index)"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
            @load="onImageLoad(index)"
            @error="onImageError(index)"
            class="preview-image"
          ></image>
          <!-- 加载状态 -->
          <view class="loading-overlay" v-if="imageLoadingStates[index]">
            <view class="loading-spinner"></view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="control-buttons">
        <view class="control-btn" @click="zoomOut" :class="{ disabled: getCurrentScale() <= 0.5 }">
          <image src="/static/images/wyh-image-preview/zoom_out.svg" mode="aspect-fit" class="control-icon"></image>
        </view>
        <view class="control-btn" @click="resetTransform">
          <image src="/static/images/wyh-image-preview/reset.svg" mode="aspect-fit" class="control-icon"></image>
        </view>
        <view class="control-btn" @click="zoomIn" :class="{ disabled: getCurrentScale() >= 3 }">
          <image src="/static/images/wyh-image-preview/zoom_in.svg" mode="aspect-fit" class="control-icon"></image>
        </view>
        <view class="control-btn" @click="rotateLeft">
          <image src="/static/images/wyh-image-preview/rotate_left.svg" mode="aspect-fit" class="control-icon"></image>
        </view>
        <view class="control-btn" @click="rotateRight">
          <image src="/static/images/wyh-image-preview/rotate_right.svg" mode="aspect-fit" class="control-icon"></image>
        </view>
      </view>
    </view>

    <!-- 缩略图预览 -->
    <view class="thumbnail-bar" v-if="images.length > 1">
      <scroll-view scroll-x class="thumbnail-scroll">
        <view v-for="(image, index) in images" :key="index" class="thumbnail-item" :class="{ active: index === currentIndex }" @click="goToImage(index)">
          <image :src="image" mode="aspectFill" class="thumbnail-image"></image>
        </view>
      </scroll-view>
    </view>

    <!-- 手势提示 -->
    <view class="gesture-hint" v-if="showGestureHint">
      <text>双指缩放，单指拖动</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  initialIndex: {
    type: Number,
    default: 0,
  },
  enableDownload: {
    type: Boolean,
    default: true,
  },
})

// Emits
const emit = defineEmits(['close', 'change', 'download'])

// 响应式数据
const currentIndex = ref(props.initialIndex)
const showGestureHint = ref(false)

// 图片变换状态
const imageStates = reactive({})

// 加载状态
const imageLoadingStates = reactive({})

// 触摸状态
const touchState = reactive({
  startX: 0,
  startY: 0,
  startDistance: 0,
  isZooming: false,
  isDragging: false,
  lastTouchTime: 0,
})

// 计算属性
const currentImage = computed(() => props.images[currentIndex.value])

// 方法
const closePreview = () => {
  emit('close')
}

const onSwiperChange = (e) => {
  const newIndex = e.detail.current
  if (newIndex !== currentIndex.value) {
    currentIndex.value = newIndex
    resetTransform()
    emit('change', newIndex)
  }
}

const getImageStyle = (index) => {
  const state = imageStates[index] || { scale: 1, rotate: 0, translateX: 0, translateY: 0 }
  return {
    transform: `translate(${state.translateX}px, ${state.translateY}px) rotate(${state.rotate}deg) scale(${state.scale})`,
    transformOrigin: 'center center',
    transition: touchState.isZooming || touchState.isDragging ? 'none' : 'transform 0.3s ease',
  }
}

const getCurrentScale = () => {
  const state = imageStates[currentIndex.value] || { scale: 1 }
  return state.scale
}

const resetTransform = () => {
  if (imageStates[currentIndex.value]) {
    imageStates[currentIndex.value] = {
      scale: 1,
      rotate: 0,
      translateX: 0,
      translateY: 0,
    }
  }
}

const zoomIn = () => {
  const state = imageStates[currentIndex.value] || { scale: 1, rotate: 0, translateX: 0, translateY: 0 }
  if (state.scale < 3) {
    state.scale = Math.min(3, state.scale + 0.2)
    imageStates[currentIndex.value] = { ...state }
  }
}

const zoomOut = () => {
  const state = imageStates[currentIndex.value] || { scale: 1, rotate: 0, translateX: 0, translateY: 0 }
  if (state.scale > 0.5) {
    state.scale = Math.max(0.5, state.scale - 0.2)
    imageStates[currentIndex.value] = { ...state }
  }
}

const rotateLeft = () => {
  const state = imageStates[currentIndex.value] || { scale: 1, rotate: 0, translateX: 0, translateY: 0 }
  state.rotate -= 90
  imageStates[currentIndex.value] = { ...state }
}

const rotateRight = () => {
  const state = imageStates[currentIndex.value] || { scale: 1, rotate: 0, translateX: 0, translateY: 0 }
  state.rotate += 90
  imageStates[currentIndex.value] = { ...state }
}

const downloadImage = async () => {
  if (!props.enableDownload) return

  const image = currentImage.value
  if (!image) return

  emit('download', image)

  try {
    // #ifdef H5
    window.open(image, '_blank')
    // #endif

    // #ifndef H5
    uni.showLoading({ title: '下载中...' })

    const downloadResult = await uni.downloadFile({ url: image })

    if (downloadResult.statusCode === 200) {
      await uni.saveImageToPhotosAlbum({ filePath: downloadResult.tempFilePath })
      uni.showToast({ title: '下载成功', icon: 'success' })
    } else {
      throw new Error('下载失败')
    }
    // #endif
  } catch (error) {
    console.error('下载失败:', error)
    uni.showToast({ title: '下载失败', icon: 'none' })
  } finally {
    // #ifndef H5
    uni.hideLoading()
    // #endif
  }
}

const handleImageClick = () => {
  const now = Date.now()
  if (now - touchState.lastTouchTime < 300) {
    // 双击重置
    resetTransform()
  }
  touchState.lastTouchTime = now
}

const onImageLoad = (index) => {
  imageLoadingStates[index] = false
}

const onImageError = (index) => {
  imageLoadingStates[index] = false
  uni.showToast({ title: '图片加载失败', icon: 'none' })
}

const goToImage = (index) => {
  currentIndex.value = index
  resetTransform()
  emit('change', index)
}

// 触摸事件处理
const onTouchStart = (e) => {
  const touches = e.touches

  if (touches.length === 2) {
    // 双指缩放
    touchState.isZooming = true
    const dx = touches[1].clientX - touches[0].clientX
    const dy = touches[1].clientY - touches[0].clientY
    touchState.startDistance = Math.sqrt(dx * dx + dy * dy)
  } else if (touches.length === 1) {
    // 单指拖动
    touchState.isDragging = true
    touchState.startX = touches[0].clientX
    touchState.startY = touches[0].clientY
  }
}

const onTouchMove = (e) => {
  const touches = e.touches
  const state = imageStates[currentIndex.value] || { scale: 1, rotate: 0, translateX: 0, translateY: 0 }

  if (touches.length === 2 && touchState.isZooming) {
    // 处理缩放
    const dx = touches[1].clientX - touches[0].clientX
    const dy = touches[1].clientY - touches[0].clientY
    const currentDistance = Math.sqrt(dx * dx + dy * dy)
    const scaleChange = currentDistance / touchState.startDistance

    state.scale = Math.max(0.5, Math.min(3, state.scale * scaleChange))
    touchState.startDistance = currentDistance
  } else if (touches.length === 1 && touchState.isDragging && state.scale > 1) {
    // 处理拖动
    const deltaX = touches[0].clientX - touchState.startX
    const deltaY = touches[0].clientY - touchState.startY

    state.translateX += deltaX
    state.translateY += deltaY

    touchState.startX = touches[0].clientX
    touchState.startY = touches[0].clientY
  }

  imageStates[currentIndex.value] = { ...state }
}

const onTouchEnd = () => {
  touchState.isZooming = false
  touchState.isDragging = false
}

// 生命周期
onMounted(() => {
  // 初始化加载状态
  props.images.forEach((_, index) => {
    imageLoadingStates[index] = true
  })

  // 显示手势提示
  setTimeout(() => {
    showGestureHint.value = true
    setTimeout(() => {
      showGestureHint.value = false
    }, 3000)
  }, 1000)
})
</script>

<style scoped>
.image-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  /* 刘海屏兼容 */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.image-preview.fullscreen {
  background-color: #000;
}

/* 顶部操作栏 */
.top-bar {
  position: absolute;
  top: 10px;
  /* #ifdef H5 */
  top: 0;
  /* #endif */
  left: 0;
  right: 0;
  height: 88rpx;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32rpx;
  z-index: 10;
  /* 刘海屏兼容 */
  padding-top: max(32rpx, env(safe-area-inset-top));
}

.page-indicator {
  color: white;
  font-size: 28rpx;
  font-weight: 500;
}

.top-actions {
  display: flex;
  gap: 24rpx;
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.action-btn:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.3);
}

.action-icon {
  width: 32rpx;
  height: 32rpx;
}

.close-btn {
  background: rgba(255, 0, 0, 0.3);
}

.close-btn:active {
  background: rgba(255, 0, 0, 0.5);
}

/* 图片展示区域 */
.image-swiper {
  flex: 1;
  width: 100%;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  user-select: none;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top: 4rpx solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 底部操作栏 */
.bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  /* 刘海屏兼容 */
  padding-bottom: max(20rpx, env(safe-area-inset-bottom));
}

.control-buttons {
  display: flex;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.1);
  padding: 16rpx 24rpx;
  border-radius: 50rpx;
  backdrop-filter: blur(10px);
}

.control-btn {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.control-btn:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.3);
}

.control-btn.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.control-icon {
  width: 36rpx;
  height: 36rpx;
}

/* 缩略图预览 */
.thumbnail-bar {
  position: absolute;
  bottom: 140rpx;
  left: 0;
  right: 0;
  height: 120rpx;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  /* 刘海屏兼容 */
  padding-bottom: env(safe-area-inset-bottom);
}

.thumbnail-scroll {
  height: 100%;
  white-space: nowrap;
  padding: 16rpx 32rpx;
}

.thumbnail-item {
  display: inline-block;
  width: 88rpx;
  height: 88rpx;
  margin-right: 16rpx;
  border-radius: 8rpx;
  overflow: hidden;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.thumbnail-item.active {
  border-color: #007aff;
  transform: scale(1.1);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
}

/* 手势提示 */
.gesture-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 16rpx 32rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0%,
  100% {
    opacity: 0;
  }
  20%,
  80% {
    opacity: 1;
  }
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .control-buttons {
    gap: 12rpx;
    padding: 12rpx 20rpx;
  }

  .control-btn {
    width: 64rpx;
    height: 64rpx;
  }

  .control-icon {
    width: 28rpx;
    height: 28rpx;
  }

  .thumbnail-item {
    width: 72rpx;
    height: 72rpx;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .image-preview {
    background-color: rgba(0, 0, 0, 0.98);
  }
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  .control-btn,
  .action-btn,
  .thumbnail-item {
    transition: none;
  }

  .loading-spinner {
    animation: none;
  }
}

/* 刘海屏特殊适配 */
@supports (padding: max(0px)) {
  .image-preview {
    padding-top: max(0px, env(safe-area-inset-top));
    padding-bottom: max(0px, env(safe-area-inset-bottom));
  }

  .top-bar {
    padding-top: max(32rpx, env(safe-area-inset-top));
  }

  .bottom-bar {
    padding-bottom: max(20rpx, env(safe-area-inset-bottom));
  }

  .thumbnail-bar {
    padding-bottom: max(16rpx, env(safe-area-inset-bottom));
  }
}

/* #ifdef APP-PLUS */
.status-bar {
  height: var(--status-bar-height);
}
/* #endif*/

/* #ifdef H5 */
.status-bar {
  height: calc(var(--status-bar-height) + env(safe-area-inset-top));
}
/* #endif */
</style>

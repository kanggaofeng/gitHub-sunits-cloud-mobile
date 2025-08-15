<template>
  <view class="demo-container">
    <view class="demo-header">
      <text class="demo-title">图片预览组件演示</text>
    </view>

    <view class="image-grid">
      <view v-for="(image, index) in imageList" :key="index" class="image-item" @click="previewImage(index)">
        <image :src="image" mode="aspectFill" class="grid-image"></image>
        <view class="image-overlay">
          <text class="image-index">{{ index + 1 }}</text>
        </view>
      </view>
    </view>

    <view class="demo-actions">
      <button class="demo-btn" @click="showAllImages">预览所有图片</button>
      <button class="demo-btn" @click="addImage">添加图片</button>
    </view>

    <!-- 图片预览组件 -->
    <wyh-image-preview v-if="previewVisible" :images="imageList" :initial-index="currentIndex" :enable-download="true" @close="closePreview" @change="onImageChange" @download="onDownload" />
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 图片列表
const imageList = ref([
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/800/600?random=3',
  'https://picsum.photos/800/600?random=4',
  'https://picsum.photos/800/600?random=5',
  'https://picsum.photos/800/600?random=6',
])

// 预览状态
const previewVisible = ref(false)
const currentIndex = ref(0)

// 预览指定图片
const previewImage = (index) => {
  currentIndex.value = index
  previewVisible.value = true
}

// 预览所有图片
const showAllImages = () => {
  currentIndex.value = 0
  previewVisible.value = true
}

// 关闭预览
const closePreview = () => {
  previewVisible.value = false
}

// 图片切换事件
const onImageChange = (index) => {
  console.log('切换到图片:', index + 1)
}

// 下载事件
const onDownload = (imageUrl) => {
  console.log('下载图片:', imageUrl)
}

// 添加图片
const addImage = () => {
  const newIndex = imageList.value.length + 1
  imageList.value.push(`https://picsum.photos/800/600?random=${newIndex}`)
  uni.showToast({
    title: '图片已添加',
    icon: 'success',
  })
}
</script>

<style scoped>
.demo-container {
  padding: 32rpx;
  background: #f5f5f5;
  min-height: 100vh;
  /* 刘海屏兼容 */
  padding-top: max(32rpx, env(safe-area-inset-top));
  padding-bottom: max(32rpx, env(safe-area-inset-bottom));
}

.demo-header {
  text-align: center;
  margin-bottom: 48rpx;
}

.demo-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 48rpx;
}

.image-item {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 12rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.grid-image {
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-item:active .image-overlay {
  opacity: 1;
}

.image-index {
  color: white;
  font-size: 32rpx;
  font-weight: bold;
}

.demo-actions {
  display: flex;
  gap: 24rpx;
}

.demo-btn {
  flex: 1;
  height: 88rpx;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.demo-btn:active {
  background: #0056cc;
}

/* 刘海屏特殊适配 */
@supports (padding: max(0px)) {
  .demo-container {
    padding-top: max(32rpx, env(safe-area-inset-top));
    padding-bottom: max(32rpx, env(safe-area-inset-bottom));
  }
}
</style>

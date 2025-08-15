<template>
  <!-- 头部组件容器 -->
  <view class="headNavWrap">
    <!-- 固定定位的导航栏 -->
    <view class="headNavInfo" :style="{ background: backgroundColor }">
      <!-- 左侧返回按钮 -->
      <view class="left-btn" @click="handleBack" v-if="showBack">
        <uni-icons type="back" size="20" :color="color" />
      </view>

      <!-- 标题 -->
      <view class="title" :style="{ color: color }">{{ title }}</view>

      <!-- 右侧插槽 -->
      <view class="right-btn">
        <slot name="right"></slot>
      </view>
    </view>

    <!-- 自动占位元素 -->
    <view class="header-placeholder" v-if="placeholder"></view>
  </view>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '标题',
    },
    showBack: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: Boolean,
      default: true,
    },
    backgroundColor: {
      type: String,
      default: '#Ffffff',
    },
    color: {
      type: String,
      default: 'rgb(0, 0, 0)',
    },
  },
  methods: {
    handleBack() {
      this.$emit('back')
      uni.navigateBack()
    },
  },
}
</script>

<style scoped>
/* 固定定位的头部 */
.headNavInfo {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  height: calc(44px + constant(safe-area-inset-top));
  height: calc(44px + env(safe-area-inset-top));
  padding: 7px 5px;
  padding-top: calc(7px + constant(safe-area-inset-top));
  padding-top: calc(7px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  z-index: 1;
  background-color: v-bind(backgroundColor);
  font-weight: bold;
}

/* 占位元素 */
.header-placeholder {
  height: 44px;
  height: calc(44px + constant(safe-area-inset-top));
  height: calc(44px + env(safe-area-inset-top));
}

/* 左侧按钮样式 */
.left-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* 标题样式 */
.title {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 17px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 50px;
  pointer-events: none;
}

/* 右侧按钮区域 */
.right-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
</style>

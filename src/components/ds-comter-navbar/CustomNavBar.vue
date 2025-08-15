<template>
  <view class="fixd-container">
    <!-- 顶部状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px', backgroundColor: statusBarBackgroundColor }"></view>

    <!-- 自定义导航栏 -->
    <view class="custom-nav" v-if="title" :style="navStyle">
      <view v-if="back" class="back-btn" @click="goBack">
        <uni-icons type="back" size="20" :color="color" />
      </view>
      <view class="title" :style="'color:' + color">{{ title }}</view>
      <view class="btn" v-if="showBtn">
        <button :class="'navSubmitBtn ' + (isDisabled ? 'disBtn' : '')" @click="submit" :disabled="isDisabled" :style="{ opacity: isDisabled ? 0.5 : 1 }">
          {{ btnTitle }}
        </button>
      </view>
    </view>

    <!-- 页面内容插槽 -->
    <view class="page-content">
      <slot></slot>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { onTabItemTap } from '@dcloudio/uni-app'

const emit = defineEmits(['submit'])

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  back: {
    type: Boolean,
    default: true,
  },
  backgroundColor: {
    type: String,
    default: 'linear-gradient(to bottom, #2160fd, #ffffff)',
  },
  statusBarBackgroundColor: {
    type: String,
    default: '#2160fd',
  },
  color: {
    type: String,
    default: '#fff',
  },
  statusBarTextStyle: {
    type: String,
    default: 'light',
  },
  showBtn: {
    type: Boolean,
    default: false,
  },
  btnTitle: {
    type: String,
    default: '',
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
})
const statusBarHeight = ref(20)

const navStyle = computed(() => {
  return {
    backgroundImage: props.backgroundColor.startsWith('linear-gradient') ? props.backgroundColor : '',
    backgroundColor: !props.backgroundColor.startsWith('linear-gradient') ? props.backgroundColor : '',
  }
})

const setStatusBarStyle = () => {
  if (typeof plus !== 'undefined') {
    plus.navigator.setStatusBarBackground('transparent')
    plus.navigator.setStatusBarStyle(props.statusBarTextStyle)
  } else {
    uni.setNavigationBarColor({
      backgroundColor: '#000000',
      frontColor: props.statusBarTextStyle === 'light' ? '#ffffff' : '#000000',
    })
  }
}

onMounted(() => {
  uni.getSystemInfo({
    success: (res) => {
      statusBarHeight.value = res.statusBarHeight
    },
  })
  setTimeout(() => {
    if (typeof plus !== 'undefined') {
      setStatusBarStyle()
    }
  }, 100)
})

// onShow(() => {
// 	setStatusBarStyle()
// })

onTabItemTap((e) => {
  setStatusBarStyle()
})

watch(
  () => [props.backgroundColor, props.statusBarTextStyle],
  () => {
    if (typeof plus !== 'undefined') {
      // 可选：动态重新设置
    }
  },
)

const goBack = () => {
  uni.navigateBack()
}

const submit = () => {
  emit('submit')
}
</script>

<style lang="scss" scoped>
.fixd-container {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  background: white;
}

.gradient-bg {
  height: 88px;
}

.status-bar {
  width: 100%;
  z-index: 1;
}

.custom-nav {
  display: flex;
  align-items: center;
  justify-content: center; /* 改为居中对齐 */
  height: 44px;
  padding: 0 10px;
  box-sizing: border-box;
  position: relative;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.back-btn {
  font-size: 20px;
  color: #ffffff;
  position: absolute;
  left: 10px;
  z-index: 2;
}

.btn {
  font-size: 20px;
  color: #ffffff;
  position: absolute;
  right: 10px;
  z-index: 2;
}

.title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 600;
  font-size: 16px;
  line-height: 18px;
  font-style: normal;
  color: #1d2129;
}

.page-content {
  flex: 1;
  background-color: #f5f5f5;
  z-index: 1;
  position: relative;
}

.navSubmitBtn {
  height: 25px;
  font-family:
    PingFangSC,
    PingFang SC;
  font-size: 14px;
  line-height: 25px;
  font-style: normal;
  color: #ffffff;
  padding: 0 10px;
  background-color: #3370ff;
}
.disBtn {
  background-color: #a5a5a5 !important;
  color: #595959 !important;
}
</style>

<template>
  <view class="loading-container">
    <view class="status-bar"></view>
    <view class="logo-content align-center justify-center flex">
      <image class="logo-img" src="/static/sunnyLogo.png" mode="widthFix"></image>
    </view>
    <view class="spinner"></view>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

// 页面挂载时：检查 token，有效则跳转，无效尝试刷新
onLoad(async () => {
  setTimeout(() => {
  	let oldToken = ''
  	try {
  		if (userStore.getName) {
  			oldToken = userStore.getToken
  		}
  	} catch (err) {
  		console.error('解析用户信息失败:', err)
  	}
  	// 校验 token
  	if (oldToken) {
  		try {
  			userStore.VerifyToken(oldToken)
  		} catch (err) {
  			console.error('token 验证失败:', err)
  			// 这里你可以考虑清除本地 user 信息
  			uni.removeStorageSync('user')
  		}
  	}else{
  		uni.navigateTo({
  			url: '/pages/login',
  		})
  	}
  }, 500)
})
</script>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  background-color: #ffffff;
  --spinner-size: 48px;
  --spinner-border: 4px;
  --spinner-color: #4285f4; /* Google 蓝 */
}

/* 简约旋转圈（Google风） */
.spinner {
  width: var(--spinner-size);
  height: var(--spinner-size);
  border: var(--spinner-border) solid #e0e0e0;
  border-top-color: var(--spinner-color);
  border-radius: 50%;
  animation: spin 0.9s ease-in-out infinite;
  margin-bottom: 30rpx;
}

.logo-content {
  width: 100%;
  font-size: 21px;
  text-align: center;
  padding-top: 30%;
  padding-bottom: 40%;
  .logo-img {
    width: 420rpx;
    border-radius: 4px;
  }

  .title {
    margin-left: 10px;
  }
}

/* 动画定义 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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

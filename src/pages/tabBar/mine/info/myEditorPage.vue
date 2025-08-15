<template>
  <CustomNavBar title="个人信息" :back="true" backgroundColor="#F5F6FA" statusBarBackgroundColor="#F5F6FA" color="#000" statusBarTextStyle="black"></CustomNavBar>

  <view class="mine-info-view">
    <view class="mine-info-item-view" @click="handleToAvatar">
      <view class="mine-info-item avatar">
        <view>头像</view>
        <image class="avatar" :src="avatarInfo" mode="aspectFill" />
      </view>
      <uni-icons type="forward" size="12" style="color: #86909c; line-height: 16px"></uni-icons>
    </view>
    <view class="mine-info-item-view" @click="handleToUpdateName">
      <view class="mine-info-item">
        <view>姓名</view>
        <view class="mine-info-item-text">{{ userInfo.nickName }}</view>
      </view>
      <uni-icons type="forward" size="12" style="color: #86909c; line-height: 16px"></uni-icons>
    </view>
    <view class="mine-info-item-view" @click="handleToUpdatePhoneNum">
      <view class="mine-info-item">
        <view>电话</view>
        <view class="mine-info-item-text">{{ userInfo.phonenumber }}</view>
      </view>
      <uni-icons type="forward" size="12" style="color: #86909c; line-height: 16px"></uni-icons>
    </view>
    <view class="mine-info-item-view" @click="handleToUpdateEmail">
      <view class="mine-info-item">
        <view>邮箱</view>
        <view class="mine-info-item-text">{{ userInfo.email }}</view>
      </view>
      <uni-icons type="forward" size="12" style="color: #86909c; line-height: 16px"></uni-icons>
    </view>
  </view>
  <view class="mine-info-item-view update-password-view" @click="handleToPwd">
    <view class="mine-info-item">
      <view>修改密码</view>
    </view>
    <uni-icons type="forward" size="12" style="color: #86909c; line-height: 16px"></uni-icons>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()

const userInfo = ref('')
const avatarInfo = ref('')

onShow(() => {
  getUserInfo()
})

const getUserInfo = () => {
  avatarInfo.value = userStore.getAvatar
  userInfo.value = userStore.getUserInfo
}

function handleToAvatar() {
  uni.navigateTo({
    url: '/pages/tabBar/mine/avatar/index',
  })
}

function handleToPwd() {
  uni.navigateTo({
    url: '/pages/tabBar/mine/pwd/index',
  })
}

//此处type可以用来区分修改的是哪个字段 0 头像 1姓名 2手机号 3邮箱
function handleToUpdateName() {
  uni.navigateTo({
    url: '/pages/tabBar/mine/info/editInfo?type=1',
  })
}

function handleToUpdatePhoneNum() {
  uni.navigateTo({
    url: '/pages/tabBar/mine/info/editInfo?type=2',
  })
}

function handleToUpdateEmail() {
  uni.navigateTo({
    url: '/pages/tabBar/mine/info/editInfo?type=3',
  })
}
</script>

<style lang="scss" scoped>
.item-box {
  background-color: #ffffff;
  margin: 30rpx;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10rpx;
  border-radius: 8rpx;
  color: #303133;
  font-size: 32rpx;
}

.mine-info-view {
  background-color: #fff;
  margin-bottom: 10px;
}

.mine-info-item-view {
  padding: 15px;
  border-bottom: 1px solid #f5f6fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar {
  height: 45px;
  width: 45px;
  border-radius: 14px;
  line-height: 45px;
  align-items: center;
  min-width: 45px;
}

.mine-info-item {
  width: 95%;
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 400;
  font-size: 15px;
  color: #1d2129;
  line-height: 16px;
  text-align: left;
  font-style: normal;
  display: flex;
  justify-content: space-between;
}
.mine-info-item-text {
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #86909c;
  line-height: 16px;
  text-align: center;
  font-style: normal;
}
.update-password-view {
  background-color: #fff;
}
</style>

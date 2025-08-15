<template>
  <CustomNavBar title="" :back="false" backgroundColor="#2160fd" statusBarTextStyle="light"></CustomNavBar>
  <view class="home-container">
    <!-- 顶部用户信息 -->
    <view class="user-info">
      <view class="head-info">
        <image class="avatar" :src="avatarInfo" mode="aspectFill" />
        <view class="user-details">
          <!--<DsSvgIcon icon="t-icon t-icon-renwuzhongxin" color="red" size="30px"/>-->

          <text class="hello-text">Hello，{{ userName }}</text>
          <!--<view class="location-info">-->
          <!--	<DsSvgIcon icon="icon-a-dingwei2x" fontSize="15px" style="margin-right: 2px"/>-->
          <!--	<text class="company-text">-->
          <!--		北京群英科技园-->
          <!--	</text>-->
          <!--	<uni-icons type="forward" size="6" style="margin-left: 3px;color:#DCE6FE"></uni-icons>-->
          <!--</view>-->
        </view>
      </view>
      <view class="setting-btn">
        <!--<DsSvgIcon icon="icon-a-xiaoxi2x" fontSize="22px" @click="messageAlerts" style="margin-right: 20px"/>-->
        <DsSvgIcon icon="icon-rili" fontSize="22px" color="#fff" @click="calendar" />
      </view>
    </view>

    <!-- 中间状态块 -->
    <view class="status-block">
      <view class="demo-uni-row">
        <view class="card-info">
          <DsInfoCard :config="pendingCardConfig">
            <template #details>
              <view class="card-info-item pending-info" @click="toWorkorderListBySatus(0)">
                <view class="card-info-item">
                  <text class="card-info-item-text">待接单：</text>
                  <text class="card-info-item-value">{{ pendingCardInfo.pendingCount }}</text>
                </view>
                <view class="card-info-item">
                  <uni-icons type="forward" size="12" style="margin-left: 3px; color: #3f3f7a; line-height: 16px"></uni-icons>
                </view>
              </view>
              <view class="card-info-item tomorrow-go-info" @click="toWorkorderListBySatus(1)">
                <view class="card-info-item">
                  <text class="card-info-item-text">明日上门：</text>
                  <text class="card-info-item-value">{{ pendingCardInfo.tomorrowCount }}</text>
                </view>
                <view class="card-info-item">
                  <uni-icons type="forward" size="12" style="margin-left: 3px; color: #3f3f7a; line-height: 16px"></uni-icons>
                </view>
              </view>
              <view class="card-info-item ongoing-info" @click="toWorkorderListBySatus(2)">
                <view class="card-info-item">
                  <text class="card-info-item-text">进行中：</text>
                  <text class="card-info-item-value">{{ pendingCardInfo.processingCount }}</text>
                </view>
                <view class="card-info-item">
                  <uni-icons type="forward" size="12" style="margin-left: 3px; color: #3f3f7a; line-height: 16px"></uni-icons>
                </view>
              </view>
              <view class="card-info-item null-info"></view>
            </template>
          </DsInfoCard>
        </view>
      </view>
    </view>

    <!-- 功能区图标 -->
    <view class="function-icons">
      <view class="icon-item" @click="noticeInfo()">
        <image class="icon" src="/static/images/index/announcement-icon.png" alt="" />
        <text class="icon-label">微服公告</text>
      </view>
      <view class="icon-item" @click="knowledgeSearchInfo()">
        <image class="icon" src="/static/images/index/knowledge-icon.png" alt="" />
        <text class="icon-label">知识查询</text>
      </view>
      <view class="icon-item" @click="helpGuideInfo()">
        <image class="icon" src="/static/images/index/help-icon.png" alt="" />
        <text class="icon-label">帮助指南</text>
      </view>
      <view class="icon-item" @click="alertInfo()">
        <image class="icon" src="/static/images/index/early-warning-icon.png" alt="" />
        <text class="icon-label">预警</text>
      </view>
      <view class="icon-item" @click="cityInfo()">
        <image class="icon" src="/static/images/index/city-icon.png" alt="" />
        <text class="icon-label">城市看板</text>
      </view>
    </view>

    <!-- 横幅广告 -->
    <view class="banner">
      <image class="banner-image" src="/static/images/index/new-policy.png" />
    </view>

    <!-- 底部功能卡片 -->
    <MessageNotifications ref="messageNotificationsRef" />
  </view>
</template>

<script setup>
// 暂时不需要复杂逻辑，后续可以加跳转

import DsInfoCard from '@/components/ds-info-card/DsInfoCard.vue'
import { getPendingWorkorderListInfo } from '@/api/index/index'
import { useUserStore } from '@/store/modules/user'
import MessageNotifications from './MessageNotifications.vue'

onShow(() => {
  init()
  getUserInfo()
})
const user = ref('')
const avatarInfo = ref('')
const userInfo = ref('')
const userName = ref('')
const current = ref(0)

const swiperDotIndex = computed(() => current.value)

const change = (e) => {
  current.value = e.detail.current
}

const userStore = useUserStore()

const pendingCardInfo = ref({
  pendingCount: 0,
  processingCount: 0,
  tomorrowCount: 0,
  pendingSumCount: 0,
})

const pendingCardConfig = ref({
  icon: '/static/images/index/pending-icon.png',
  title: '待处理',
  showNum: true,
  num: 0,
  tip: '今日新增+3',
  tipColor: 'red',
  bgColor: '#f7faff',
  iconSize: '40px',
})

const init = () => {
  getPendingWorkorderListInfo().then((res) => {
    pendingCardInfo.value = {
      ...res.data,
    }
    pendingCardConfig.value.num = res.data.pendingCount + res.data.processingCount
  })
}

const getUserInfo = () => {
  avatarInfo.value = userStore.getAvatar
  userInfo.value = userStore.getUserInfo
  userName.value = userInfo.value.nickName
}

const calendar = () => {
  console.log('日历')
}

const messageAlerts = () => {
  console.log('消息')
}

const toWorkorderListBySatus = (status) => {
  switch (status) {
    case 0:
      uni.setStorageSync('workorderTab', {
        mainTab: 'processing',
        subTab: 0,
      })
      uni.switchTab({
        url: '/pages/tabBar/workorder/workorderPage', // 0 代表“待接单”
      })
      break
    case 1:
      // uni.setStorageSync('workorderTab', {
      //   mainTab: 'processing',
      // })
      // uni.switchTab({
      //   url: '/pages/tabBar/workorder/workorderPage', // 1 代表“明日上门”
      // })
      break
    case 2:
      uni.setStorageSync('workorderTab', {
        mainTab: 'processing',
        subTab: 1,
      })
      uni.switchTab({
        url: '/pages/tabBar/workorder/workorderPage', // 1 代表“进行中”
      })
      break
  }
}

const noticeInfo = () => {
  console.log('公告')
}

const knowledgeSearchInfo = () => {
  console.log('知识查询')
}

const helpGuideInfo = () => {
  console.log('帮助指南')
}

const alertInfo = () => {
  console.log('预警')
}

const cityInfo = () => {
  console.log('城市看板')
}
</script>

<style lang="scss" scoped>
.home-container {
  padding: 15px;
  background: linear-gradient(to bottom, #2160fd 10%, #f5f6fa 30%);
  max-height: 100%;
  box-sizing: border-box;
}

.user-info {
  display: flex;
  align-items: center;
  border-radius: 16rpx;
  color: white;
  position: relative;
  min-height: 45px;
}

.head-info {
  display: flex;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 30%;
  margin-right: 13px;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hello-text {
  height: 16px;
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 600;
  font-size: 16px;
  color: #ffffff;
  line-height: 45px;
  text-align: left;
  font-style: normal;
}

.location-info {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
}

.company-text {
  height: 15px;
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 500;
  font-size: 12px;
  color: #ffffff;
  line-height: 15px;
  text-align: left;
  font-style: normal;
}

.setting-btn {
  position: absolute;
  right: 20rpx;
  top: 20rpx;
}

.status-block {
  margin: 15px 0;
}

.demo-uni-row {
  display: flex;
  gap: 10px;
}

.demo-uni-col {
  flex: 1;
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.card-info {
  flex: 1;
}

.card-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
}

.card-info-item-text {
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 500;
  font-size: 12px;
  color: #3f3f7a;
  line-height: 16px;
  text-align: left;
  font-style: normal;
}

.card-info-item-value {
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 500;
  font-size: 13px;
  color: #3f3f7a;
  line-height: 16px;
  text-align: left;
  font-style: normal;
}

.pending-info {
  width: 41vw;
  height: 34px;
  background-image: url('@/static/images/index/pendging-bgImage.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: 5px;
}

.tomorrow-go-info {
  width: 41vw;
  height: 34px;
  background-image: url('@/static/images/index/tomorrow-go-bgImage.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: 5px;
}

.ongoing-info {
  width: 41vw;
  height: 34px;
  background-image: url('@/static/images/index/ongoing-bgImage.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: 5px;
}

.null-info {
  width: 41vw;
  height: 34px;
  background-image: url('@/static/images/index/null-bgImage.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: 5px;
}

.function-icons {
  display: flex;
  justify-content: space-around;
  border-radius: 16px;
  margin-bottom: 20px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  image {
    width: 48px;
    height: 48px;
  }
}

.icon-label {
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 500;
  font-size: 12px;
  color: #333333;
  line-height: 14px;
  text-align: right;
  font-style: normal;
  margin-top: 8px;
}

.banner {
  margin-bottom: 15px;
}

.banner-image {
  width: 100%;
  height: 80px;
  border-radius: 16rpx;
}

.bottom-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 2px;
  background: #ffffff;
  border-radius: 10px;
}

.card-view {
  flex: 1 1 45%;
  padding: 10px;
  margin: 0;
  background: linear-gradient(180deg, #e3f2ff 0%, #ffffff 30%);
  border-radius: 10px;
  height: 150px;
}

.swiper-view {
  height: 150px;
}

.swiper-box {
  padding: 0 5px 0 0;
}

.card-title-div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
}

.notice-image {
  width: 45px;
  height: 20px;
}

.icon {
  width: 45px;
  height: 45px;
}

.card-title {
  background: linear-gradient(270deg, #ffa810 0%, #ff850f 100%), #2b67fe;
  border-radius: 3px;
  padding: 0 5px 0 4px;
  color: #fff;
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 500;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
  font-style: normal;
  margin-left: 5px;
}

.card-link {
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #949aa7;
  line-height: 14px;
  text-align: center;
  font-style: normal;
}

.card-content-time {
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #9298a7;
  line-height: 18px;
  text-align: center;
  font-style: normal;
}

.card-content-text {
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 500;
  font-size: 13px;
  color: #1e2024;
  line-height: 18px;
  text-align: left;
  font-style: normal;
}

.card-content {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}

.notice-icon {
  width: 14px;
  height: 14px;
  background: #e3f2ff;
  border-radius: 4px;
  margin-left: 5px;
}
.card-contnet-time-view {
  margin-right: 5px;
}

.uni-swiper__warp {
  height: 110px;
}
</style>

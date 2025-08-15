<template>
  <CustomNavBar title="" :back="true" backgroundColor="#2160fd" statusBarTextStyle="light"></CustomNavBar>

  <view class="home-container">
    <!-- 顶部用户信息 -->
    <view class="user-info">
      <view class="head-info">
        <image class="avatar" :src="avatarInfo" mode="aspectFill" />
        <view class="user-details">
          <text class="hello-text">{{ userName }}</text>
          <view class="location-info">
            <text class="company-text">账号：{{ userInfo.userName }}</text>
          </view>
        </view>
      </view>
      <view class="setting-btn">
        <!--<DsSvgIcon icon="icon-a-xiaoxi2x" fontSize="22px" @click="messageAlerts" style="margin-right: 20px"/>-->
        <DsSvgIcon icon="icon-shezhi" fontSize="22px" color="#fff" @click="myInfo" />
      </view>
    </view>

    <!-- 中间状态块 -->
    <view class="status-block">
      <view class="card-info-item" v-for="(item, index) in cardInfoList" @click="clickCardInfo(index)">
        <view class="card-info-item-icon">
          <DsSvgIcon :icon="'t-icon ' + item.icon" style="width: 46px; height: 46px"></DsSvgIcon>
        </view>
        <view class="card-info-item-text">{{ item.text }}</view>
      </view>
    </view>

    <view class="steps-content">
      <view class="submit-section">
        <button class="submit-btn" @click="handleLogout">退出登录</button>
      </view>
    </view>
  </view>
  <view>
    <uni-popup ref="popup" type="dialog">
      <uni-popup-dialog type="info" cancelText="关闭" confirmText="退出" title="通知" content="确定注销并退出系统吗" @confirm="dialogConfirm" @close="dialogClose"></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/modules/user'
import { clearAllScrollerCache } from '@/components/workorder-scroller/useScroller'

const userStore = useUserStore()
const popup = ref(null)
const user = ref('')
const avatarInfo = ref('')
const userInfo = ref('')
const userName = ref('')

const cardInfoList = ref([
  {
    icon: 't-icon-xiangmukanban',
    text: '项目看板',
  },
  {
    icon: 't-icon-baowaidingdan1',
    text: '保外订单',
  },
  {
    icon: 't-icon-guanyuwomen',
    text: '关于我们',
  },
  {
    icon: 't-icon-renwuzhongxin1',
    text: '任务中心',
  },
  {
    icon: 't-icon-xiangmuzhaomu1',
    text: '项目招募',
  },
  {
    icon: 't-icon-kefuwujineng',
    text: '可服务技能',
  },
  {
    icon: 't-icon-dianzigongpai',
    text: '电子工牌',
  },
  {
    icon: 't-icon-dizhiguanli',
    text: '地址管理',
  },
])

const clickCardInfo = (index) => {
  console.log(index, 11111)
}

const myInfo = () => {
  uni.navigateTo({
    url: '/pages/tabBar/mine/info/myEditorPage',
  })
}

const getUserInfo = () => {
  avatarInfo.value = userStore.getAvatar
  userInfo.value = userStore.getUserInfo
  userName.value = userStore.getName
}

function handleLogout() {
  popup.value.open()
}
const dialogConfirm = () => {
  //console.log('----------------点击确认------------')
  clearAllScrollerCache()
  userStore.LogOut().then(() => {
    uni.reLaunch({
      url: '/pages/login',
    })
  })
}

function dialogClose() {
  //console.log('点击关闭')
}

const handleToPwd = () => {
  uni.navigateTo({
    url: '/pages/tabBar/mine/pwd/index',
  })
}

onShow(() => {
  getUserInfo()
})
</script>

<style lang="scss" scoped>
.home-container {
  padding: 20px 15px;
  height: 85vh;
  background: linear-gradient(180deg, #2160fd 15%, #95b1fb 35%, #f5f5f5 40%);
  max-height: 100%;
  box-sizing: border-box;

  .user-info {
    display: flex;
    align-items: center;
    border-radius: 16rpx;
    color: white;
    position: relative;
    padding: 0 5px;

    .head-info {
      display: flex;
    }

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 30%;
      margin-right: 13px;
      min-height: 56px;
    }

    .user-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .hello-text {
      height: 25px;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 600;
      font-size: 18px;
      color: #ffffff;
      line-height: 25px;
      text-align: left;
      font-style: normal;
    }

    .location-info {
      display: flex;
      align-items: center;
      margin-top: 8px;
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
      right: 5px;
      top: 5px;
    }
  }

  .status-block {
    margin: 20px 0;
    background: #fffffe;
    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    padding: 16px 20px;
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 每行4个 */
    gap: 5px 5px; /* 列间距5px，行间距5px */
    row-gap: 20px; /* 单独控制行间距 */

    .card-info-item {
      display: flex;
      align-items: center;
      flex-direction: column;
    }

    .card-info-item-text {
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 13px;
      color: #333333;
      line-height: 14px;
      text-align: right;
      font-style: normal;
      margin-top: 10px;
    }
  }
  .submit-section {
    padding: 10px 0;

    .submit-btn {
      background-color: #3370ff;
      color: #ffffff;
      height: 45px;
      line-height: 45px;
      font-size: 16px;
      font-weight: 500;
      width: 100%;
      transition: all 0.2s ease;

      &:active {
        box-shadow: 0 2px 4px rgba(51, 112, 255, 0.2);
      }
    }
  }
}
</style>

<template>
  <view class="rootview">
    <!-- <view class="uni-divider">
			<view class="uni-divider__content">打开权限设置界面</view>
			<view class="uni-divider__line"></view>
		</view> -->
    <button @click="gotoAppPermissionSetting">打开App权限设置界面</button>

    <uni-segmented-control :current="current" :values="items" @clickItem="onClickItem" style-type="button" active-color="#4cd964"></uni-segmented-control>
    <view>
      <view v-show="current === 0">
        <view class="uni-divider">
          <view class="uni-divider__content">iOS应用权限检查</view>
          <view class="uni-divider__line"></view>
        </view>
        <button :disabled="!isIos" @click="judgeIosPermission('location')">位置权限</button>
        <button :disabled="!isIos" @click="judgeIosPermission('camera')">摄像头权限</button>
        <button :disabled="!isIos" @click="judgeIosPermission('photoLibrary')">相册权限</button>
        <button :disabled="!isIos" @click="judgeIosPermission('record')">麦克风权限</button>
        <button :disabled="!isIos" @click="judgeIosPermission('push')">推送权限</button>
        <button :disabled="!isIos" @click="judgeIosPermission('contact')">通讯录权限</button>
        <button :disabled="!isIos" @click="judgeIosPermission('calendar')">日历权限</button>
        <button :disabled="!isIos" @click="judgeIosPermission('memo')">备忘录权限</button>

        <view class="uni-divider">
          <view class="uni-divider__content">iOS的设备状态监测</view>
          <view class="uni-divider__line"></view>
        </view>
        <view class="commontitle">与手机相关，与应用无关</view>
        <button :disabled="!isIos" @click="checkSystemLocationStatus">检查设备的位置服务是否开启</button>
      </view>
      <view v-show="current === 1">
        <view class="uni-divider">
          <view class="uni-divider__content">Android应用权限检查</view>
          <view class="uni-divider__line"></view>
        </view>
        <view class="commontitle">除非同意或永久拒绝，否则会弹框</view>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.ACCESS_FINE_LOCATION')">位置权限</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.ACCESS_COARSE_LOCATION')">模糊位置权限(蓝牙\ble依赖)</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.CAMERA')">摄像头权限</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE')">外部存储(含相册)读取权限</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.WRITE_EXTERNAL_STORAGE')">外部存储(含相册)写入权限</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.RECORD_AUDIO')">麦克风权限</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.READ_CONTACTS')">通讯录读取权限</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.WRITE_CONTACTS')">通讯录写入权限</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.READ_CALENDAR')">日历读取权限</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.WRITE_CALENDAR')">日历写入权限</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.READ_SMS')">短信读取权限</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.SEND_SMS')">短信发送权限</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.RECEIVE_SMS')">接收新短信权限</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.READ_PHONE_STATE')">获取手机识别码等信息的权限</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.CALL_PHONE')">拨打电话权限</button>
        <button :disabled="isIos" @click="requestAndroidPermission('android.permission.READ_CALL_LOG')">获取通话记录权限</button>

        <view class="uni-divider">
          <view class="uni-divider__content">Android的设备状态监测</view>
          <view class="uni-divider__line"></view>
        </view>
        <view class="commontitle">与手机相关，与应用无关</view>
        <button :disabled="isIos" @click="checkSystemLocationStatus">检查设备的位置服务是否开启</button>
        <button :disabled="isIos" @click="gotoAndroidPermissionSetting">打开Android网络设置界面</button>
      </view>
    </view>
  </view>
</template>

<script>
import permision from '@/js_sdk/system-permission/permission/aQungXian.js'
import uniSegmentedControl from '@/components/uni-segmented-control/uni-segmented-control.vue'
export default {
  components: {
    uniSegmentedControl,
  },
  data() {
    return {
      isIos: true,
      items: ['iOS', 'Android'],
      current: 0,
    }
  },
  onLoad() {
    // #ifdef APP-PLUS
    this.isIos = plus.os.name == 'iOS'
    // #endif
  },
  methods: {
    onClickItem(index) {
      if (this.current !== index) {
        this.current = index
      }
    },
    judgeIosPermission: function (permisionID) {
      var result = permision.judgeIosPermission(permisionID)
      console.log(result)
      var strStatus = result ? '已' : '未'
      uni.showModal({
        content: permisionID + '权限' + strStatus + '获得授权',
        showCancel: false,
      })
    },
    async requestAndroidPermission(permisionID) {
      var result = await permision.requestAndroidPermission(permisionID)
      var strStatus
      if (result == 1) {
        strStatus = '已获得授权'
      } else if (result == 0) {
        strStatus = '未获得授权'
      } else {
        strStatus = '被永久拒绝权限'
      }
      uni.showModal({
        content: permisionID + strStatus,
        showCancel: false,
      })
    },
    gotoAppPermissionSetting: function () {
      permision.gotoAppPermissionSetting()
    },
    checkSystemLocationStatus: function () {
      // var result = permision.checkSystemEnableLocation()
      // console.log(result);
      uni.showModal({
        content: '本机的位置服务开启状态：' + permision.checkSystemEnableLocation(),
        showCancel: false,
      })
    },
    gotoAndroidPermissionSetting: function () {
      var main = plus.android.runtimeMainActivity() //获取activity
      var Intent = plus.android.importClass('android.content.Intent')
      var Settings = plus.android.importClass('android.provider.Settings')
      var intent = new Intent(Settings.ACTION_WIRELESS_SETTINGS) //可设置http://ask.dcloud.net.cn/question/14732这里所有Action字段
      main.startActivity(intent)
    },
  },
}
</script>

<style lang="scss" scoped>
page {
  background-color: #f4f5f6;
  line-height: 1.5;
}

button {
  margin: 15px;
  color: #007aff;
}

.rootview {
  padding: 0 15px 20px;
}

/* 分界线 */
.uni-divider {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.uni-divider__content {
  font-size: 16px;
  color: #999999;
  padding: 0 10px;
  position: relative;
  z-index: 101;
  background: #f4f5f6;
}

.uni-divider__line {
  background-color: #cccccc;
  height: 1px;
  width: 99%;
  position: absolute;
  z-index: 100;
  top: 50%;
  left: 0;
  transform: translateY(50%);
}

.commontitle {
  font-size: 14px;
  color: #999999;
  text-align: center;
}
</style>

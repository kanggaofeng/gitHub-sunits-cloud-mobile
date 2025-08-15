<template>
  <view class="normal-login-container">
    <view class="logo-content align-center justify-center flex">
      <image class="logo-img" src="/static/sunnyLogo.png" mode="widthFix"></image>
    </view>
    <view class="login-form-content">
      <view class="input-item flex align-center">
        <view class="iconfont icon-user icon"></view>
        <input v-model="loginForm.username" class="input" type="text" placeholder="请输入账号" maxlength="30" />
      </view>
      <view class="input-item flex align-center">
        <view class="iconfont icon-password icon"></view>
        <input v-model="loginForm.password" :type="showPassword ? 'password' : 'text'" class="input" placeholder="请输入密码" maxlength="20" />
        <view class="iconfont" :class="showPassword ? 'icon-yincang' : 'icon-xianshi'" @click="togglePassword" style="margin-right: 15px; color: #999"></view>
      </view>
      <!-- <view class="input-item flex align-center" style="width: 60%;margin: 0px;" v-if="captchaEnabled">
        <view class="iconfont icon-code icon"></view>
        <input v-model="loginForm.code" type="number" class="input" placeholder="请输入验证码" maxlength="4" />
        <view class="login-code">
          <image :src="codeUrl" @click="getCode" class="login-code-img"></image>
        </view  >
      </view> -->
      <view class="action-btn">
        <button @click="handleLogin" class="login-btn" :class="{ isLoading: isLoggingIn }">{{ isLoggingIn ? '登录中...' : '登录' }}</button>
      </view>
      <view class="forget-password">
        <text @click="handleForgetPassword" class="forget-text">忘记密码</text>
      </view>
    </view>

    <view class="privacyContent">
      <checkbox-group @change="selectData">
        <checkbox :checked="isSelectXieYi" style="transform: scale(0.7)" color="#035ee9" :disabled="isLoggingIn" />
      </checkbox-group>
      <view class="titDesc">
        登录即代表同意
        <span @click="handleUserAgrement" class="linkTit">《用户协议》</span>
        <span @click="handlePrivacy" class="linkTit">《隐私协议》</span>
      </view>
    </view>
  </view>
</template>

<script setup>
import { getCodeImg, sendCidAndDeviceInfo } from '@/api/login'

import config from '@/config.js'
import { useUserStore } from '@/store/modules/user'
import useDictStore from '@/store/modules/dict'
import { decrypt } from '@/utils/crypto'

const userStore = useUserStore()
const dictStore = useDictStore()
const codeUrl = ref('')
const captchaEnabled = ref(true)
const globalConfig = ref(config)
const isLoggingIn = ref(false)
const isSelectXieYi = ref(true)
const showPassword = ref(true)

const loginForm = ref({
  username: '',
  password: '',
  code: '',
  uuid: '',
})

// 隐私协议
function handlePrivacy() {
  let site = globalConfig.value.appInfo.agreements[0]
  uni.navigateTo({
    url: `/pages/common/PreviewCommon/index?title=${site.title}&url=${site.url}`,
  })
}

// 用户协议
function handleUserAgrement() {
  let site = globalConfig.value.appInfo.agreements[1]
  uni.navigateTo({
    url: `/pages/common/PreviewCommon/index?title=${site.title}&url=${site.url}`,
  })
}

function selectData(e) {
  isSelectXieYi.value = e.detail.value.length > 0
}

// 获取图形验证码
// function getCode() {
//   getCodeImg().then(res => {
//     captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
//     if (captchaEnabled.value) {
//       codeUrl.value = 'data:image/gif;base64,' + res.img
//       loginForm.value.uuid = res.uuid
//     }
//   })
// };

async function handleLogin() {
  if (isLoggingIn.value) return
  if (loginForm.value.username === '') {
    uni.showToast({
      title: '请输入您的账号',
      mask: false,
      duration: 1000,
    })
  } else if (loginForm.value.password === '') {
    uni.showToast({
      title: '请输入您的密码',
      mask: false,
      duration: 1000,
    })
  } else if (!isSelectXieYi.value) {
    uni.showToast({
      title: '请先勾选隐私协议',
      icon: 'none',
      duration: 1000,
    })
  } else {
    isLoggingIn.value = true
    pwdLogin()
  }
}
// 密码登录
async function pwdLogin() {
  userStore
    .Login(loginForm.value)
    .then(() => {
      loginSuccess(loginForm.value)
      getAppPushCidAndDeviceInfo()
    })
    .catch((error) => {
      isLoggingIn.value = false
      if (captchaEnabled.value) {
        // getCode()
      }
    })
}

function loginSuccess(result) {
  // 设置用户信息
  userStore
    .GetInfo()
    .then((res) => {
      userStore.SET_CODE(result.password)
      // 获取字典和城市数据
      Promise.all([dictStore.getAllProgectvxFn(), dictStore.getAllCityvxFn(), dictStore.getallDictData()])
        .then(() => {
          isLoggingIn.value = false
          uni.switchTab({
            url: '/pages/tabBar/home/homePage',
          })
        })
        .catch((err) => {
          isLoggingIn.value = false
          uni.showToast({
            title: '获取数据失败',
            icon: 'none',
            duration: 2000,
          })
          console.error(err)
        })
    })
    .catch((error) => {
      isLoggingIn.value = false
      uni.showToast({
        title: error?.msg || '获取用户信息失败',
        icon: 'none',
        duration: 2000,
      })
    })
}

function getAppPushCidAndDeviceInfo() {
  //#ifdef APP-PLUS
  plus.push.getClientInfoAsync((info) => {
    let cid = info['clientid']
    const systemInfo = uni.getSystemInfoSync()

    const sys = systemInfo.system.toLowerCase()
    let platform = '未知'
    if (sys.includes('android')) platform = '1'
    else if (sys.includes('ios')) platform = '2'
    else if (sys.includes('harmonyos') || sys.includes('鸿蒙')) platform = '3'

    console.log('CID:', cid)
    console.log('设备型号:', systemInfo.model)
    console.log('平台:', platform)
    sendCidAndDeviceInfo({
      clientId: cid,
      platform: platform,
    })
      .then((res) => {
        console.log('发送CID成功', res)
      })
      .catch((err) => {
        console.error('发送CID失败', err)
      })
  })
  // #endif
}

function togglePassword() {
  showPassword.value = !showPassword.value
}

function handleForgetPassword() {
  uni.navigateTo({
    url: '/pages/tabBar/mine/pwd/index',
  })
}

// 页面挂载时：检查 token，有效则跳转，无效尝试刷新
onLoad(async () => {
  try {
    if (userStore.getName) {
      loginForm.value.username = userStore.getName
      loginForm.value.password = decrypt(userStore.getCode)
    }
  } catch (err) {
    console.error('解析用户信息失败:', err)
  }
})
// getCode();
</script>

<style lang="scss" scoped>
page {
  background-color: #ffffff;
}

.normal-login-container {
  width: 100%;
  background: white;
  height: 100vh;
  .logo-content {
    width: 100%;
    font-size: 21px;
    text-align: center;
    padding-top: 35%;
    .logo-img {
      width: 210px;
      border-radius: 4px;
    }

    .title {
      margin-left: 10px;
    }
  }

  .login-form-content {
    text-align: center;
    margin: 20px auto;
    margin-top: 20%;
    width: 80%;

    .input-item {
      margin: 20px auto;
      background-color: #f5f6f7;
      height: 45px;
      border-radius: 20px;
      position: relative;

      .icon {
        font-size: 38rpx;
        margin-left: 10px;
        color: #999;
      }

      .input {
        width: 100%;
        font-size: 14px;
        line-height: 20px;
        text-align: left;
        padding-left: 15px;
        padding-right: 40px;
      }
    }

    .login-btn {
      margin-top: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(270deg, rgb(83, 121, 250) 0%, rgb(106, 161, 255) 100%);
      border-radius: 5px;
      font-size: 16px;
      font-weight: 500;
      color: rgb(255, 255, 255);
      &.isLoading {
        opacity: 0.7;
        pointer-events: none;
      }
    }

    .xieyi {
      color: #333;
      margin-top: 20px;
    }

    .login-code {
      height: 38px;
      float: right;

      .login-code-img {
        height: 38px;
        position: absolute;
        margin-left: 10px;
        width: 200rpx;
      }
    }
  }
}

.privacyContent {
  display: flex;
  box-sizing: border-box;
  position: fixed;
  display: flex;
  align-items: center;
  height: 50px;
  bottom: 5vh;
  z-index: 10;
  padding-left: 20px;
  .selectedBox {
    width: 13px;
    height: 13px;
    margin-right: 5px;
    border-radius: 2px;
    border: 1px solid #86909c;
    display: flex;
    justify-content: center;
    align-items: center;
    .duiImg {
      color: #035ee9;
      height: 13px;
      line-height: 13px;
    }
  }
  .titDesc {
    flex: 1;
    font-size: 12px;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    color: #4e5969;
    margin-left: 3px;
    .linkTit {
      color: #035ee9;
    }
  }
}

.forget-password {
  text-align: right;
  padding-top: 15px;
  box-sizing: border-box;
  .forget-text {
    font-size: 12px;
    font-weight: 400;
    color: #488ce4;
  }
}
</style>

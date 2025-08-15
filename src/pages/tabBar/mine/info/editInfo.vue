<template>
  <CustomNavBar
    :title="'修改' + title"
    :back="true"
    backgroundColor="#F5F6FA"
    statusBarBackgroundColor="#F5F6FA"
    color="#000"
    statusBarTextStyle="black"
    :showBtn="true"
    :btnTitle="'保存'"
    :isDisabled="!canSubmit"
    @submit="editInfo"
  ></CustomNavBar>
  <view class="mine-info-view">
    <view class="mine-info-item-view">
      <view class="mine-info-item">
        <input v-model="newInfo" :placeholder="'请输入' + title" :focus="true" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { updateUserProfile } from '@/api/system/user'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const title = ref('')
const info = ref('')
const newInfo = ref('')
const type = ref(-1)
const user = ref({})
const userInfo = ref({})

onLoad((option) => {
  type.value = option.type
})

onShow(() => {
  userInfo.value = userStore.getUserInfo
  switch (type.value) {
    case '0': {
      break
    }
    case '1': {
      title.value = '姓名'
      info.value = userInfo.value.nickName
      newInfo.value = userInfo.value.nickName
      break
    }
    case '2': {
      title.value = '电话'
      info.value = userInfo.value.phonenumber
      newInfo.value = userInfo.value.phonenumber
      break
    }
    case '3': {
      title.value = '邮箱'
      newInfo.value = userInfo.value.email
      break
    }
  }
})

const canSubmit = computed(() => newInfo.value.trim() !== '' && newInfo.value !== info.value)

function editInfo() {
  const phoneReg = /^1[3-9]\d{9}$/ // 简单的中国大陆手机号校验
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // 通用邮箱校验

  switch (type.value) {
    case '1': {
      // updateName
      updateInfo('nickName', newInfo.value)
      break
    }
    case '2': {
      // updatePhonenumber
      if (!phoneReg.test(newInfo.value)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none',
        })
        return
      }
      updateInfo('phonenumber', newInfo.value)
      break
    }
    case '3': {
      // updateEmail
      if (!emailReg.test(newInfo.value)) {
        uni.showToast({
          title: '请输入正确的邮箱',
          icon: 'none',
        })
        return
      }
      updateInfo('email', newInfo.value)
      break
    }
  }
}

const updateInfo = async (param, value) => {
  let data = { ...userInfo.value }
  data[param] = value
  updateUserProfile(data).then((res) => {
    if (res.code == 200) {
      uni.showToast({
        title: '修改成功',
        mask: false,
        duration: 1000,
      })
      user.value.userInfo = data
      userStore.SET_USERINFO(data)
      uni.navigateBack()
    } else {
      uni.showToast({
        title: res.msg,
        icon: 'none',
        duration: 1000,
      })
    }
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
  margin-bottom: 20px;
}

.mine-info-item-view {
  padding: 15px;
  border-bottom: 1px solid #f5f6fa;
  display: flex;
  justify-content: space-between;
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

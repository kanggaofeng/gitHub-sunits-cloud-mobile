<template>
  <uni-popup ref="popup" type="bottom" @close="handleClose">
    <view class="uni-grid-9">
      <view class="uni-grid-9-item" v-for="(item, index) in props.btnList" :key="index" @tap="handleButtonClick(item)">
        <view class="button-icon-head">
          <text :class="['t-icon', getButtonIcon(item.buttonType)]" />
        </view>
        <view class="button-icon-head">
          <text class="uni-grid-9-text">{{ item.buttonName }}</text>
        </view>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { useUserStore } from '@/store/modules/user.js'

const props = defineProps({
  btnList: {
    type: Array,
    default: () => [],
  },
})

const { proxy } = getCurrentInstance()
const userStore = useUserStore()

// 获取按钮图标
const getButtonIcon = (buttonType) => {
  const iconMap = {
    1: 't-icon-zhuanpai', // 转派
    12: 't-icon-tefeishenqing', // 特费申请
    2: 't-icon-suishouji', // 随手记
    3: 't-icon-chexiao', // 撤单
    10: 't-icon-tuihuishangyibu', // 退回上一步
    11: 't-icon-judan', // 拒单
  }
  return iconMap[buttonType] || 't-icon-gengduo'
}

// 处理按钮点击
const handleButtonClick = (item) => {
  popup.value.close()
  const pathMap = {
    1: '/pages/workorder-detail/workorderModules/BottomButton/OtherButton/transfer/transferPage', // 网点内转派
    2: '/pages/workorder-detail/workorderModules/BottomButton/OtherButton/redispatch', // 跨网点重派
    3: '/pages/workorder-detail/workorderModules/BottomButton/OtherButton/cancel',
    10: '/pages/workorder-detail/workorderModules/BottomButton/OtherButton/rollback/rollbackPage',
    11: '/pages/workorder-detail/workorderModules/BottomButton/OtherButton/refuse/refusePage',
    12: '/pages/workorder-detail/workorderModules/BottomButton/OtherButton/specialFee/downstreamSpecialFeePage',
  }
  const path = pathMap[item.buttonType]
  if (path) {
    uni.navigateTo({ url: path })
  }
}

// 弹框引用
const popup = ref(null)

// 关闭弹框
const handleClose = () => {
  popup.value.close()
}

const open = () => {
  popup.value.open()
}

// 对外暴露方法
defineExpose({
  open,
})
</script>

<style lang="scss" scoped>
@import '@/static/icon/iconfont.css';
.uni-grid-9 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 20px 10px;
  background-color: white;
  border-top-right-radius: 15px;
  border-top-left-radius: 15px;
}
.t-icon {
  width: 52px;
  height: 52px;
}
.uni-grid-9-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 50%;
  // width: 80px;
  // height: 80px;
  box-sizing: border-box;
  aspect-ratio: 1/1;
  margin: 0 auto;
}

.button-icon-head {
  margin-bottom: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.uni-grid-9-text {
  font-size: 13px;
  font-weight: 400;
  color: rgba(50, 50, 50, 1);
  text-align: center;
  word-break: break-word;
  margin-top: 3px;
}

.uni-grid-9-item-hover {
  background-color: #f5f5f5;
}
</style>

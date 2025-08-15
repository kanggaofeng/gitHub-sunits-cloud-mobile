<template>
  <uni-popup ref="popupRef" type="center" :mask-click="true">
    <view class="popup-container">
      <view class="popup-header">
        <text class="popup-title">{{ message.title || '消息详情' }}</text>
        <view class="close-btn" @click="closePopup">
          <uni-icons type="closeempty" size="22" color="#bbb" />
        </view>
      </view>
      <view class="popup-content">
        <text class="popup-content-text">{{ message.content || '暂无内容' }}</text>
      </view>
      <view class="popup-footer">
        <button v-if="message.canJump" class="popup-btn jump-btn" @click="handleJump">前往查看</button>
        <button class="popup-btn confirm-btn" @click="closePopup">关闭</button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const popupRef = ref(null)

// 定义props
const props = defineProps({
  message: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

// 定义emits
const emit = defineEmits(['jump'])

// 关闭弹窗
const closePopup = () => {
  if (popupRef.value) {
    popupRef.value.close()
  }
}

// 处理前往查看
const handleJump = () => {
  closePopup()
  emit('jump', props.message)
}

// 打开弹窗的方法
const open = (msg) => {
  if (msg) {
    props.message = msg
  }
  if (popupRef.value) {
    popupRef.value.open()
  }
}

// 暴露方法给父组件
defineExpose({
  open,
  close: closePopup,
})
</script>

<style lang="scss" scoped>
// 弹窗样式
.popup-container {
  background: #fff;
  border-radius: 20px;
  width: 86vw;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(44, 62, 80, 0.18);
  overflow: hidden;
  position: relative;
  padding-bottom: 12px;

  .popup-header {
    position: relative;
    padding: 24px 24px 10px 24px;
    padding-bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .popup-title {
      color: #222;
      font-weight: 700;
      font-size: 18px;
      text-align: center;
      letter-spacing: 0.5px;
    }

    .close-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f6fa;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(44, 62, 80, 0.06);
      cursor: pointer;
      transition: background 0.2s;
      z-index: 2;
      &:active {
        background: #e6e8f0;
      }
    }
  }

  .popup-content {
    padding: 22px 24px 10px 24px;
    color: #333;
    font-size: 16px;
    line-height: 1.7;
    min-height: 48px;
    border-bottom: 1px solid #f2f3f5;

    .popup-content-text {
      white-space: pre-wrap;
      margin-bottom: 8px;
      word-break: break-all;
    }
  }

  .popup-footer {
    display: flex;
    flex-direction: row;
    gap: 14px;
    align-items: center;
    justify-content: flex-end;
    padding: 18px 24px 0 24px;

    .popup-btn {
      border: none;
      cursor: pointer;
      font-size: 16px;
      border-radius: 22px;
      height: 42px;
      min-width: 92px;
      padding: 0 22px;
      margin: 0;
      transition: all 0.2s;
      font-weight: 500;
      box-shadow: none;
      outline: none;
      display: flex;
      align-items: center;
      justify-content: center;

      &.jump-btn {
        background: linear-gradient(90deg, #4a81ff 0%, #2f6afe 100%);
        color: #fff;
        border: none;
        box-shadow: 0 2px 8px rgba(47, 106, 254, 0.1);
        &:active {
          background: linear-gradient(90deg, #2f6afe 0%, #4a81ff 100%);
        }
      }

      &.confirm-btn {
        background: #f5f6fa;
        color: #2f6afe;
        border: 1px solid #e6e8f0;
        &:active {
          background: #e6e8f0;
        }
      }
    }
  }
}
</style>

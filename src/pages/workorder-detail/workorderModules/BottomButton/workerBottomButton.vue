<template>
  <div class="bottom-button-container" v-if="mainButtonText">
    <div class="bottom-left" @click="handleMoreClick">
      <DsSvgIcon icon="icon-gengduo" fontSize="22px" color="#3870fd" />
      <span class="bottom-left-text">更多</span>
    </div>
    <div class="bottom-right" @click="handleMainButtonClick">
      <span class="bottom-right-text" v-if="isLoadingBottomBtn">加载中</span>
      <span class="bottom-right-text" v-else>{{ mainButtonText }}</span>
    </div>
    <OtherButton ref="OtherButtonRef" :btn-list="btnList" />
  </div>
</template>

<script setup>
import useWorkOrderStore from '@/store/modules/workOrder'
import { getIncidentBtnList, forwardIncTask } from '@/api/workOrder/index.js'
import OtherButton from './OtherButton/OtherButton.vue'

const { proxy } = getCurrentInstance()
const workOrderStore = useWorkOrderStore()
const basicInfo = computed(() => workOrderStore.basicInfo)

// 控制底部按钮显示
const showBottomButton = computed(() => {
  // 状态3是已撤单，状态4是已关单，这两种状态不展示底部按钮
  // 当按钮列表为空时也不展示底部按钮
  return btnList.value.length > 0 && mainButtonText.value
})

const mainButtonText = ref('')
const btnList = ref([])
const mainButtonInfo = ref(null)
const emit = defineEmits(['ok', 'nextNode'])
const isLoadingBottomBtn = ref(false)

// 获取当前主按钮类型
const getMainButtonType = () => {
  return mainButtonInfo.value?.buttonType
}

// 初始化按钮列表
const init = async () => {
  if (!basicInfo.value?.id) return
  isLoadingBottomBtn.value = true
  try {
    const res = await getIncidentBtnList(basicInfo.value.id)
    if (res.code === 200 && res.data.length > 0) {
      isLoadingBottomBtn.value = false
      // 设置主按钮信息
      const mainBtn = res.data.find((item) => {
        return item.sort === '3'
      })
      if (mainBtn) {
        mainButtonText.value = mainBtn.buttonName
        mainButtonInfo.value = mainBtn
      } else {
        mainButtonText.value = ''
        mainButtonInfo.value = null
      }
      // 保存非主按钮列表
      btnList.value = res.data.filter((item) => !(item.sort === '3'))
    }
  } catch (error) {
    console.error('获取按钮列表失败:', error)
  } finally {
    isLoadingBottomBtn.value = false
  }
}

// 主按钮点击处理
const handleMainButton = async () => {
  const buttonType = getMainButtonType()
  // 关单操作
  if (buttonType === '9') {
    uni.showModal({
      title: '提示',
      content: '是否确认操作?',
      showCancel: false,
      showCancel: true,
      confirmText: '确定',
      success: function (res) {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/workorder-detail/workorderModules/BottomButton/OtherButton/closeOrder/closeOrderPage',
          })
        }
      },
    })
  } else {
    emit('nextNode')
  }
}

// 打开其他按钮面板
const openOhterButton = () => {
  proxy.$refs['OtherButtonRef'].open()
}

// 处理更多按钮点击
const handleMoreClick = () => {
  if (!isLoadingBottomBtn.value && btnList.value.length > 0) {
    openOhterButton()
  }
}

// 处理主按钮点击
const handleMainButtonClick = () => {
  if (!isLoadingBottomBtn.value) {
    handleMainButton()
  }
}

// 暴露方法
const setLoadingState = (isLoading) => {
  isLoadingBottomBtn.value = isLoading
}

defineExpose({
  init,
  setLoadingState
})
</script>

<style lang="scss" scoped>
.bottom-button-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
  background: linear-gradient(180deg, #3870fd 0%, #97b4ff 100%);
  box-shadow: 0px -2px 10px 0px rgba(150, 148, 148, 0.06);
  display: flex;
  align-items: center;
  z-index: 5;
  .bottom-left {
    width: 55px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100%;
    background: #fff;
    justify-content: center;
    .bottom-left-text {
      color: #3870fd;
      font-size: 10px;
    }
  }

  .bottom-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    .bottom-right-text {
      color: #fff;
      font-size: 18px;
      font-weight: 500;
    }
  }
}
</style>

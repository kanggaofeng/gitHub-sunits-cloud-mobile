<template>
  <div class="func-container" v-if="funcItems.length > 0">
    <div class="func-list">
      <div v-for="item in funcItems" :key="item.icon" class="func-item" @click="goToLink(item)">
        <DsSvgIcon :icon="item.icon" fontSize="16px" color="#3870fd" />
        <span class="func-text">{{ item.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import workOrder from '@/store/modules/workOrder'
import useWorkOrderStore from '@/store/modules/workOrder'

const { proxy } = getCurrentInstance()
const workOrderStore = useWorkOrderStore()
const basicInfo = computed(() => workOrderStore.basicInfo)

const funcItems = [
  { icon: 'icon-fuwufangan', text: '服务方案' },
  {
    icon: 'icon-liuchengguiji',
    text: '流程轨迹',
    link: '/pages/workorder-detail/workorderModules/OtherFunction/processTrajectories/processTrajectories?workorderId=' + basicInfo.value.id,
  },
  { icon: 'icon-dianzigongpai1', text: '电子工牌' },
  { icon: 'icon-beijianxinxi', text: '备件信息' },
  {
    icon: 'icon-fujianxinxi',
    text: '附件信息',
    link: '/pages/workorder-detail/workorderModules/OtherFunction/uploadFilesInfo/uploadFilesInfo?workorderId=' + basicInfo.value.id,
  },
  { icon: 'icon-chulirizhi', text: '处理日志' },
  { icon: 'icon-kehuqianming', text: '客户签名' },
]

const goToLink = (item) => {
  if (item.link) {
    uni.navigateTo({
      url: item.link,
    })
  }
}
</script>

<style scoped>
.func-container {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
}

.func-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 每行4个 */
  gap: 5px 5px; /* 行间距10px，列间距5px */
  row-gap: 10px; /* 单独控制行间距 */
}

.func-item {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f5ff;
  border: 1px solid #3870fd;
  border-radius: 8px;
  padding: 8px 0; /* 上下padding控制高度 */
}

.func-text {
  font-size: 12px;
  color: #3870fd;
  margin-left: 4px;
}
</style>

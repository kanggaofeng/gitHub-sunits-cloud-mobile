<template>
  <view>
    <CustomNavBar title="流程轨迹" :back="true" backgroundColor="#fff" statusBarBackgroundColor="#fff" color="#000" statusBarTextStyle="black"></CustomNavBar>
    <view class="timeline-container">
      <view class="timelineCard">
        <DsTimeLine :items="timelineData">
          <template #content="itemInfo">
            <view class="timelineCard__content">
              <view class="timelineCard__content__title">
                {{ itemInfo.item.activityName }}
                <view class="timelineCard__content__btn_show_btn" v-if="itemInfo.item.izShow">
                  <DsSvgIcon v-if="itemInfo.item.expanded" icon="icon-shouqi" fontSize="18px" @click.stop="toggleExpand(itemInfo.item)" />
                  <DsSvgIcon v-if="!itemInfo.item.expanded" icon="icon-zhankai" fontSize="18px" @click.stop="toggleExpand(itemInfo.item)" />
                </view>
              </view>
              <view class="timelineCard__content__body">
                <view class="timelineCard__content__body__time" v-if="itemInfo.item.lastProcessingEndDate && itemInfo.item.lastProcessingEndTime">
                  {{ itemInfo.item.lastProcessingEndDate }}&nbsp;{{ itemInfo.item.lastProcessingEndTime }}
                </view>
                <view class="timelineCard__content__body__userInfo" v-if="itemInfo.item.processingNickName && itemInfo.item.processingUserName">
                  {{ itemInfo.item.processingNickName }}({{ itemInfo.item.processingUserName }})
                </view>
              </view>
              <view class="timelineCard__content__expand" v-if="itemInfo.item.expanded">
                <progressItemDetail :incActivityDetailInfo="itemInfo.item.incActivityDetailInfo"></progressItemDetail>
              </view>
            </view>
          </template>
        </DsTimeLine>
      </view>
    </view>
  </view>
</template>

<script setup>
import DsTimeLine from '@/components/ds-time-line/DsTimeLine.vue'

import progressItemDetail from './progressItemDetail.vue'
import { getProgressDetailInfo, getProgressTrajectoryList } from '@/api/workOrder/index.js'

const localWorkorderId = ref('')

onLoad((options) => {
  localWorkorderId.value = options.workorderId
  init()
})

const timelineData = ref([])

const init = () => {
  getProgressTrajectoryList(localWorkorderId.value).then((res) => {
    timelineData.value = res.data.leftInfoList.map((item) => ({
      ...item,
      izExpand: false,
    }))
  })
}

// 切换单个展开/折叠
const toggleExpand = async (item) => {
  if (item.izShow == 1) {
    if (!item.expanded) {
      if (!item.incActivityDetailInfo) {
        let res = await getProgressDetailInfo(item.incActivityId)
        if (res.code == 200) {
          item.incActivityDetailInfo = res.data
          item.expanded = !item.expanded
        } else {
          ElMessage.error(res.msg)
        }
      } else {
        item.expanded = !item.expanded
      }
    } else {
      item.expanded = !item.expanded
    }
  }
}

const tagConfigList = {
  1: {
    icon: 'zhuanpai',
    iconClass: 'transfer',
    color: '#3B8AFF',
    name: '转派',
  },
  2: {
    icon: 'chongpai',
    iconClass: 'reSend',
    color: '#5eb2a6',
    name: '重派',
  },
  3: {
    icon: 'huitui',
    iconClass: 'returned',
    color: '#985cd6',
    name: '回退',
  },
  4: {
    icon: 'chedan',
    iconClass: 'canceled',
    color: '#70778c',
    name: '撤单',
  },
  5: {
    icon: 'judan',
    iconClass: 'rejected',
    color: '#e2483d',
    name: '拒单',
  },
  6: {
    icon: 'gaiyue',
    iconClass: 'recontracting',
    color: '#e6a23c',
    name: '改约',
  },
}

const getTagStatusClass = (type) => {
  return tagConfigList[type].iconClass
}

const getTagStatusName = (type) => {
  return tagConfigList[type].name
}

const getTagStatusIcon = (type) => {
  return tagConfigList[type].icon
}

const getActivityName = (item) => {
  if (!item.activityName) return ''

  let details = ''

  if (item.processingNickName || item.processingUserName) {
    details = `: ${item.processingNickName || ''}${item.processingUserName ? ` (${item.processingUserName})` : ''}`
  }

  return `${item.activityName}${details}`
}
</script>

<style scoped>
.transfer {
  color: #3b8aff;
  border: 1px solid rgba(59, 138, 255, 0.3);
  border-left: 5px solid #3b8aff;
}

.reSend {
  color: #5eb2a6;
  border: 1px solid rgba(94, 178, 166, 0.3);
  border-left: 5px solid #5eb2a6;
}

.returned {
  color: #985cd6;
  border: 1px solid rgba(152, 92, 214, 0.3);
  border-left: 5px solid #985cd6;
}

.canceled {
  color: #70778c;
  border: 1px solid rgba(112, 119, 140, 0.3);
  border-left: 5px solid #70778c;
}

.rejected {
  color: #e2483d;
  border: 1px solid rgba(226, 72, 61, 0.3);
  border-left: 5px solid #e2483d;
}

.recontracting {
  color: #e6a23c;
  border: 1px solid rgba(230, 162, 60, 0.3);
  border-left: 5px solid #e6a23c;
}

.timeline-container {
  padding-top: 10px;
  height: 101%;
}
.timelineCard {
  padding: 20px;
  background: #fff;
}

.timelineCard__content {
  min-height: 50px;
  margin: 0 0 7px 5px;
}

.timelineCard__content__title {
  display: flex;
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 500;
  font-size: 13px;
  color: #515151;
  line-height: 15px;
  text-align: left;
  font-style: normal;
  gap: 10px;
  margin-bottom: 10px;
  justify-content: space-between;
}
.timelineCard__content__body {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  line-height: 15px;
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 500;
  color: #a2a2a2;
  text-align: left;
  font-style: normal;
  font-size: 13px;
  gap: 10px;
}
.timelineCard__content__expand {
  margin: 10px 0;
  background-color: #f5f6fa;
  border-radius: 5px;
}
</style>

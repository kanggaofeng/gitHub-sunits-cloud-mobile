<!-- src/components/DashboardCard/index.vue -->
<template>
  <view class="ds-info-card" :style="{ background: config.bgColor || '#fff' }">
    <view class="ds-info-card-header">
      <view class="ds-info-card-icon-wrapper">
        <image :src="config.icon" :style="{ width: config.iconSize, height: config.iconSize }" />
      </view>

      <view class="ds-info-card-title-info">
        <view class="ds-info-card-title-box">
          <view class="ds-info-card-title" :style="{ fontSize: config.titleFontSize || '15px' }">
            {{ config.title }}
            <!-- 角标 -->
            <view v-if="config.showNum" class="ds-info-card-badge-num">{{ formatNum(config.num) }}</view>
            <view v-else class="ds-info-card-remind-point"></view>
          </view>
        </view>
        <!--<view class="ds-info-card-status" :style="{ color: config.tipColor }">{{ config.tip }}</view>-->
      </view>
    </view>

    <!-- 自定义插槽区域 -->
    <view class="ds-info-card-details">
      <slot name="details" />
    </view>
  </view>
</template>

<script setup lang="ts">
interface DetailItem {
  text: string
  value: string | number
  color?: string
  arrow?: boolean
}

interface CardConfig {
  icon: string
  iconSize?: string
  title: string
  titleFontSize?: string
  tip?: string
  tipColor?: string
  bgColor?: string
  details?: DetailItem[]
}

function formatNum(num: number | string | undefined): string {
  if (!num) return '0'
  const n = Number(num)
  return n > 99 ? '99+' : String(n)
}

defineProps<{
  config: CardConfig
}>()
</script>

<style scoped>
.ds-info-card {
  border-radius: 8px;
  border: 1px solid #ffffff;
  padding: 12px;
}
.ds-info-card-header {
  display: flex;
  margin-bottom: 5px;
}

.ds-info-card-title-info {
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ds-info-card-title-box {
  display: flex;
  align-items: center;
  justify-content: center;
}
.ds-info-card-title {
  position: relative;
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 600;
  font-size: 15px;
  color: #333333;
  text-align: left;
  font-style: normal;
}
.ds-info-card-status {
  height: 16px;
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 400;
  font-size: 11px;
  color: #8b96a1;
  line-height: 16px;
  text-align: left;
  font-style: normal;
  margin-top: 5px;
}
.ds-info-card-details {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
  align-content: space-around;
}
.ds-info-card-detail-item {
}

.ds-info-card-num {
  padding: 1px;
  border-radius: 1px;
  background-color: red;
}
.ds-info-card-remind-point {
  background-color: red;
  width: 5px;
  height: 5px;
  border-radius: 3px;
}

.ds-info-card-badge-num {
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  right: -30px;
  background: red;
  color: #fff;
  padding: 0 4px;
  height: 17px;
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  border-radius: 4px;
  margin-left: 5px;
}
</style>

<template>
  <view class="history-container">
    <CustomNavBar title="历史特费申请" :back="true" backgroundColor="#2160fd" />
    <workorder-scroller :dataSource="scrollerData" emptyText="暂无历史记录" :refresherEnabled="false">
      <div v-if="scrollerData.list && scrollerData.list.length > 0" class="history-card-container">
        <view v-for="item in scrollerData.list" :key="item.id" class="history-card">
          <view class="card-header">
            <view class="history-card-title">
              <view class="title-icon"></view>
              特费申请
            </view>
            <view :class="['status', statusClass(item.approvalStatus)]">{{ getStatusLabel(item.approvalStatus) }}</view>
          </view>
          <view class="divider"></view>
          <view class="card-content">
            <view class="fileCard">
              <text class="field-label">申请类型:</text>
              <text class="field-value">{{ getApplyTypeLabel(item.applyType) }}</text>
            </view>
            <view class="fileCard">
              <text class="field-label">申请金额:</text>
              <text class="field-value">{{ formatAmount(item.applyAmount) }}</text>
            </view>
            <view class="fileCard">
              <text class="field-label">申请原因:</text>
              <text class="field-value">{{ item.reason || '暂无' }}</text>
            </view>
            <view class="fileCard">
              <text class="field-label">申请时间:</text>
              <text class="field-value">{{ item.createTime }}</text>
            </view>

            <!-- Divider and Approval Info -->
            <!-- <view class="divider" v-if="item.approvalStatus != '0'"></view> -->
            <LineWithSemicircles v-if="item.approvalStatus != '0'" />
            <div class="fileBottom" v-if="item.approvalStatus != '0'">
              <view v-if="item.approvalStatus === '1'" class="fileCard">
                <text class="field-label">审批金额:</text>
                <text class="field-value approved-amount">{{ formatAmount(item.approvalAmount) }}</text>
              </view>
              <view class="fileCard">
                <text class="field-label">审批说明:</text>
                <text :class="['field-value', { 'rejected-reason': item.approvalStatus === '2' }]">{{ item.approvalContent || '暂无' }}</text>
              </view>
            </div>
          </view>
        </view>
      </div>
    </workorder-scroller>
  </view>
</template>

<script setup>
import WorkorderScroller from '@/components/workorder-scroller/workorder-scroller.vue'
import { useScroller } from '@/components/workorder-scroller/useScroller'
import { getSpecialFeeList } from '@/api/xiangMu-peiZhi/specialFeeInfoApi.js'
import LineWithSemicircles from '@/components/LineWithSemicircles/LineWithSemicircles.vue'
import useWorkOrderStore from '@/store/modules/workOrder.js'

const { proxy } = getCurrentInstance()
const workOrderStore = useWorkOrderStore()

// 字典映射
const applyTypeMap = computed(() => new Map((proxy.getAllDict('special_cost_type') || []).map((item) => [item.value, item.label])))
const statusMap = computed(() => new Map((proxy.getAllDict('special_fee_approval_status') || []).map((item) => [item.value, item.label])))

// 状态类名映射
const STATUS_CLASSES = {
  0: 'pending',
  1: 'approved',
  2: 'rejected',
}

// 工具函数
const getApplyTypeLabel = (value) => (!value ? '暂无' : applyTypeMap.value.get(value) || value)
const getStatusLabel = (status) => (!status ? '暂无' : statusMap.value.get(status) || status)
const statusClass = (status) => STATUS_CLASSES[status] || ''
const formatAmount = (amount) => {
  if (amount === null || amount === undefined || amount === '') return '¥0.00'
  const num = Number(amount)
  return isNaN(num) ? '¥0.00' : `¥${num.toFixed(2)}`
}

// 分页服务
const scrollerData = useScroller({
  fetchService: (params) => {
    // incidentId 必须传递
    const incidentId = workOrderStore.basicInfo?.id
    return getSpecialFeeList({
      ...params,
      incidentId,
      // 其它筛选参数可按需添加
    })
  },
  useCache: false,
  isAllRefresh: true,
  cacheKey: () => `downstream-special-fee-history-${workOrderStore.basicInfo?.id || ''}`,
})
</script>

<style lang="scss" scoped>
// 容器样式
.history-container {
  background: #f8fafc;
  height: 100vh;

  .history-card-container {
    padding: 10px;
  }
}

// 卡片样式
.history-card {
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 12px 15px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
}

// 卡片头部
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .history-card-title {
    font-weight: 500;
    font-size: 14px;
    color: #333333;
    display: flex;
    align-items: center;

    .title-icon {
      width: 6px;
      height: 6px;
      background-color: #3b82f6;
      border-radius: 50%;
      margin-right: 8px;
    }
  }

  .status {
    font-weight: 500;
    font-size: 13px;
    padding: 2px 6px;
    border-radius: 4px;

    &.pending {
      color: #ff7500;
    }
    &.approved {
      color: #27b86b;
    }
    &.rejected {
      color: #da3131;
    }
  }
}

// 卡片内容
.card-content .fileCard {
  display: flex;
  padding: 4px 0;
  justify-content: flex-start;
  align-items: flex-start;

  .field-label {
    margin-right: 5px;
    min-width: 65px;
    flex-shrink: 0;
    font-weight: 400;
    font-size: 13px;
    color: #78808d;
  }

  .field-value {
    word-break: break-all;
    font-weight: 400;
    font-size: 13px;
    color: #333333;
  }

  .approved-amount {
    color: #22c55e;
    font-weight: 600;
  }

  .rejected-reason {
    color: #da3131;
    font-weight: 500;
  }
}

// 分隔线
.divider {
  border-top: 1px dashed #e2e8f0;
  margin: 12px 0 12px;
}
</style>

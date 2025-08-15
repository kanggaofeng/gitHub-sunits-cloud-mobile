<template>
	<view :class="['ds-time-line', directionClass]">
		<slot name="before" />
		<view
			v-for="(item, index) in items"
			:key="index"
			class="ds-time-line-item"
		>

			<!-- 轴线和点 -->
			<view class="ds-time-line-axis">
				<view class="ds-time-line-dot" >
					<slot name="dot" :item="item" :index="index">
						<view :class="index==0?'default-first-dot':'default-dot'"/>
					</slot>
				</view>
				<view class="ds-time-line-line" v-if="index!=items.length-1 || showEndLine" :style="lineStyle"/>
			</view>


			<view class="ds-time-line-content">
				<!-- 时间插槽 -->
				<slot name="time" :item="item" :index="index">
					<text>{{ item.time }}</text>
				</slot>
				<!-- 内容插槽 -->
				<slot name="content" :item="item" :index="index">
					<text>{{ item.content }}</text>
				</slot>
			</view>
		</view>
		<slot name="after" />
	</view>
</template>

<script setup>

const props = defineProps({
	items: {
		type: Array,
		default: () => [],
	},
	direction: {
		type: String,
		default: 'vertical', // 'horizontal' 也可
		validator: val => ['horizontal', 'vertical'].includes(val),
	},
	showEndLine:{
		type: Boolean,
    default: false,
	},
	lineStyle:{
		type: Object,
		default: () => ({})
	}
})

const directionClass = computed(() =>
	props.direction === 'horizontal' ? 'is-horizontal' : 'is-vertical'
)
</script>

<style scoped>
.ds-time-line {
	display: flex;
	flex-direction: column;
}

.is-horizontal {
	flex-direction: row;
	overflow-x: auto;
}

.ds-time-line-item {
	display: flex;
}

.is-horizontal .ds-time-line-item {
	flex-direction: column;
	margin-right: 40rpx;
}

.ds-time-line-axis {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.ds-time-line-dot {
	width: 12px;
	height: 15px;
	border-radius: 50%;
	background-color: transparent;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 4rpx;
}

.default-dot {
	width: 5px;
	height: 5px;
	border-radius: 50%;
	background: #ccc;
}

.default-first-dot{
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: #fff;
	border: 3px solid #456ff4;
}

.ds-time-line-line {
	width: 5rpx;
	flex-grow: 1;
	background-color: #efefef;
}

.ds-time-line-content {
	flex: 1;
	font-size: 28rpx;
	margin-left: 10px;
}
</style>

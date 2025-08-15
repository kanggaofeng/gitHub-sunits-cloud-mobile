<template>
	<view class="progress-bar-container">
		<!-- 外部进度条 -->
		<view
			class="progress-bar"
			:style="{
        backgroundColor: backgroundColor,
        height: barHeight + 'px',
        width: '100%',
        borderRadius: barRadius + 'px',
      }"
		>
			<view
				class="progress-inner"
				:style="{
          width: progress + '%',
          backgroundColor: progressColor,
          height: '100%',
          borderRadius: barRadius + 'px',
        }"
			>
				<!-- 判断百分比文本显示的位置 -->
				<text
					v-if="showPercentage && type === 'inside'"
					class="progress-text"
					:style="textStyle"
				>
					{{ progress }}%
				</text>
			</view>
		</view>

		<!-- 进度条外部文本 -->
		<text
			v-if="showPercentage && type === 'outside'"
			class="progress-text"
			:style="textStyleOutside"
		>
			{{ progress }}%
		</text>
	</view>
</template>

<script setup>
import { ref, watchEffect  } from "vue";

// 接收的 props
const props = defineProps({
	//进度条 百分比
	progress: {
		type: Number,
		required: true,
		default: 0,
	},
	// 进度条显示位置
	type: {
		type: String,
		required: true,
		default: "inside", // 'inside' 或 'outside'
	},
	// 是否显示百分比
	showPercentage: {
		type: Boolean,
		required: true,
		default: true,
	},
	// 进度条颜色
	progressColor: {
		type: String,
		required: true,
		default: "#3a7afe",
	},
	// 进度条背景颜色
	backgroundColor: {
		type: String,
		required: true,
		default: "#f0f0f0",
	},
	// 进度条高度
	barHeight: {
		type: Number,
		required: true,
		default: 8,
	},
	// 进度条圆角
	barRadius: {
		type: Number,
		required: true,
		default: 4,
	},
});

// 计算动态样式
const textStyle = {
	position: "absolute",
	left: "50%",
	top: "50%",
	transform: "translate(-50%, -50%)",
	color: "#fff",
	fontWeight: "bold",
};

const textStyleOutside = {
	position: "absolute",
	left: "100%",
	transform: "translateX(10px)",
	color: "#333",
	fontWeight: "bold",
};

// 使用 watchEffect 自动响应
const progress = ref(props.progress);

watchEffect(() => {
	progress.value = Math.min(Math.max(props.progress, 0), 100);
});
</script>

<style scoped>
.progress-bar-container {
	position: relative;
	width: 100%;
}

.progress-bar {
	position: relative;
	border-radius: 8px;
	overflow: hidden;
}

.progress-inner {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
}

.progress-text {
	font-size: 14px;
	color: #fff;
}

.progress-text-outside {
	font-size: 14px;
	color: #333;
}
</style>

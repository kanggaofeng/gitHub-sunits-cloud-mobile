# 图片预览组件 (wyh-image-preview)
https://ext.dcloud.net.cn/plugin?id=22683
一个功能完善的图片预览组件，支持缩放、旋转、下载等功能，完美兼容刘海屏设备。

## 功能特性

- 🖼️ 多图片轮播预览
- 🔍 双指缩放和单指拖动
- 🔄 图片旋转（左转/右转）
- 💾 图片下载
- 🎯 缩略图快速切换
- ⚡ 流畅的动画效果
- 📱 响应式设计
- ♿ 无障碍支持
- 📱 刘海屏完美兼容

## 使用方法

### 基础用法

```vue
<template>
  <view>
    <button @click="showPreview">预览图片</button>
    
    <wyh-image-preview
      v-if="visible"
      :images="imageList"
      :initial-index="0"
      @close="visible = false"
      @change="onImageChange"
      @download="onDownload"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const imageList = ref([
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg'
])

const showPreview = () => {
  visible.value = true
}

const onImageChange = (index) => {
  console.log('当前图片索引:', index)
}

const onDownload = (imageUrl) => {
  console.log('下载图片:', imageUrl)
}
</script>
```

### 高级用法

```vue
<template>
  <wyh-image-preview
    v-if="visible"
    :images="imageList"
    :initial-index="currentIndex"
    :enable-download="true"
    @close="handleClose"
    @change="handleChange"
    @download="handleDownload"
  />
</template>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| images | Array | [] | 图片URL数组 |
| initialIndex | Number | 0 | 初始显示的图片索引 |
| enableDownload | Boolean | true | 是否启用下载功能 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| close | - | 关闭预览时触发 |
| change | index | 切换图片时触发，参数为当前图片索引 |
| download | imageUrl | 下载图片时触发，参数为图片URL |

## 手势操作

- **单指拖动**: 当图片放大时，可以单指拖动图片
- **双指缩放**: 双指捏合可以缩放图片
- **双击**: 双击图片可以重置到原始大小
- **滑动**: 左右滑动可以切换图片

## 刘海屏兼容性

组件完美支持各种刘海屏设备：

- **iPhone X/11/12/13/14/15系列**: 自动适配顶部刘海和底部Home指示器
- **Android刘海屏**: 支持各种异形屏设备
- **安全区域**: 使用CSS `env(safe-area-inset-*)` 确保内容不被遮挡
- **动态适配**: 根据设备自动调整布局和间距

## 样式定制

组件使用CSS变量，可以通过以下方式定制样式：

```css
:root {
  --preview-bg-color: rgba(0, 0, 0, 0.95);
  --control-btn-bg: rgba(255, 255, 255, 0.2);
  --control-btn-active-bg: rgba(255, 255, 255, 0.3);
}
```

## 注意事项

1. 确保图片URL可以正常访问
2. 下载功能在H5环境下会直接打开图片，在App环境下会保存到相册
3. 组件会自动处理图片加载状态和错误状态
4. 刘海屏兼容性会自动生效，无需额外配置

## 更新日志

### v2.1.0
- 移除全屏功能，简化组件逻辑
- 优化刘海屏兼容性，支持所有异形屏设备
- 改进安全区域适配，确保内容不被遮挡
- 优化触摸体验和动画效果

### v2.0.0
- 使用Vue 3 Composition API重构
- 优化触摸手势处理
- 改进UI设计和动画效果
- 添加缩略图预览功能
- 增强错误处理和加载状态
- 支持无障碍访问 
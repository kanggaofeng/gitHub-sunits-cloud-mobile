
---

# 📘 吸顶导航栏组件说明文档

---

## 📌 组件概述

该组件为一个**自定义导航栏**，具备以下核心特性：

* 吸顶导航栏（使用 `position: sticky`）
* 动态设置标题、背景颜色、按钮及返回操作
* 可选的右侧操作按钮（如“提交”）
* 状态栏颜色控制（适配 App 和小程序）
* 支持插槽作为页面内容承载区

---

## 🔧 使用方式

```vue
<template>
  <CustomNavBar
    title="我的页面"
    :back="true"
    background-color="linear-gradient(to bottom, #2160fd, #ffffff)"
    color="#fff"
    :show-btn="true"
    btn-title="提交"
    :is-disabled="false"
    @submit="handleSubmit"
  >
    <!-- 页面内容插槽 -->
    <view>你的页面内容...</view>
  </CustomNavBar>
</template>
```

---

## 📥 Props 属性

| 属性名                  | 类型        | 默认值                                            | 说明                  |
| -------------------- | --------- | ---------------------------------------------- | ------------------- |
| `title`              | `String`  | `''`                                           | 页面标题文本              |
| `back`               | `Boolean` | `true`                                         | 是否显示返回按钮            |
| `backgroundColor`    | `String`  | `linear-gradient(to bottom, #2160fd, #ffffff)` | 背景颜色或渐变背景           |
| `color`              | `String`  | `'#fff'`                                       | 标题文字、按钮图标颜色         |
| `statusBarTextStyle` | `String`  | `'light'`                                      | 状态栏文字颜色样式（仅 App 有效） |
| `showBtn`            | `Boolean` | `false`                                        | 是否显示右侧提交按钮          |
| `btnTitle`           | `String`  | `''`                                           | 提交按钮标题文字            |
| `isDisabled`         | `Boolean` | `false`                                        | 提交按钮是否禁用            |

---

## 🔨 Emits 事件

| 事件名        | 参数 | 说明                                |
| ---------- | -- | --------------------------------- |
| `submit`   | 无  | 点击右侧按钮时触发                         |
| `backPage` | 无  | 点击返回按钮时触发（内部已默认触发 `navigateBack`） |

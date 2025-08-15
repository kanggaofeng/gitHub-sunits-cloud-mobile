# 📦 DsSvgIcon 自定义图标组件

- **组件名**：`DsSvgIcon`
- **版本**：`1.0.1`
- **作者**：`lyh`
- **更新时间**：2025-04-29
- **功能描述**：统一封装阿里巴巴矢量图标，支持单色和多色图标显示。

---

## ✨ 属性（Props）

| 属性名 | 类型   | 默认值   | 说明 | 单色支持 | 多色支持 |
| :---- | :----- | :------ | :--- | :------ | :------ |
| `icon` | `String` | -       | 图标名称（必填，需与阿里巴巴矢量库项目中的 symbol 名称一致） | 直接传 icon 名称 | 必须传 `t-icon` 和 `t-icon-图标名` |
| `color` | `String` | `#8a8a8a` | 图标颜色 | 生效 | 不生效 |
| `size` | `String` | `14px`   | 图标大小 | 生效 | 不生效 |

---

## 🧩 使用示例

需要在main.js中全局挂载或者局部页面引入DsSvgIcon组件
```js
import DsSvgIcon from '@/components/DS-Svg-Icon/DsSvgIcon.vue'
```


以及在App.vue中引入对应css文件
```css
/* 全局引入iconfont.css */
@import '@/static/icon/iconfont.css';
@import '@/static/icon/iconfont-webapp-icon.css';
```

### 单色模式
> 直接传 icon 名称。

```vue
<template>
  <DsSvgIcon icon="icon-a-xuexi3x" size="14px" color="#8a8a8a" />
</template>
```

### 多色模式
> 必须传完整 class，包括 `t-icon` 和具体的图标名称。

```vue
<template>
  <DsSvgIcon icon="t-icon t-icon-renwuzhongxin" color="red" size="30px" />
</template>
```

---

## ⚠️ 注意事项
- 当前组件引用图标来源于阿里巴巴矢量图标库项目：**DS_app 2025**。
- 单色图标名称必须与项目中定义的 symbol 名称保持一致，例如：`icon-a-xuexi3x`。
- 多色图标名称需要执行css转化工具，将多色图标转为 base64 内嵌到 CSS 中，从而兼容 H5、App、小程序等平台，名称格式`t-icon t-icon-图标名`。
- 如果需要新增图标，请联系 UI 设计师提供图标，或自行上传至项目（需要 UI 将你加入对应项目权限）。
- 由于 fontIcon 本身不支持渐变色图标，**渐变效果的图标请使用图片资源代替**。

---

## 📎 相关链接

- **阿里云矢量图标库项目**：[DS_app 2025](https://www.iconfont.cn/manage/index?spm=a313x.illustrations_3d_detail.i3.22.876e3a81qsFtWR&manage_type=myprojects&projectId=4907541)

---

## 🛠️ 图标文件引入说明

**注意：**  
阿里云下载的图标文件默认生成的 CSS **不支持多色图标**，需要手动执行转化工具，将多色图标转为 base64 内嵌到 CSS 中，从而兼容 H5、App、小程序等平台。

### 操作流程
1. 将阿里云下载的图标文件解压缩到本地。
2. 将解压后的文件内容，全部放到项目 `/static/icon` 目录下 不要删除`generate-iconfont-css.js`文件。
3. 进入 `/static/icon` 目录执行`generate-iconfont-css.js` 或者直接在终端中执行`node .\src\static\icon\generate-iconfont-css.js
苹果电脑 cd src/static/icon && node generate-iconfont-css.js

执行完成后，即可自动处理多色图标，生成兼容各端的平台样式。

---
## 📝 更新日志
### 1.0.1 (2025-04-29)
支持多色图标

补充多色图标css生成工具
<template>
  <!-- 在需要添加横线半圆的地方使用这个组件 -->
  <div class="line-with-semicircles"></div>
</template>

<style scoped>
.line-with-semicircles {
  border: 1px dashed #e2e8f0;

  position: relative;
  margin: 12px 0 12px;
}

/* 左边半圆 */
.line-with-semicircles::before {
  content: '';
  position: absolute;
  width: 15px; /* 半圆直径 */
  height: 15px; /* 半圆直径 */
  border: 1px solid #f8fafc; /* 半圆边框 */
  border-radius: 50%; /* 圆形 */
  background-color: #f5f6fa; /* 背景色，与页面背景一致 */
  top: 50%;
  left: -23px; /* 定位到横线左端 */
  transform: translateY(-50%); /* 垂直居中 */
  border-right: none; /* 移除右边框，使半圆与横线自然连接 */
}

/* 右边半圆 */
.line-with-semicircles::after {
  content: '';
  position: absolute;
  width: 15px; /* 半圆直径 */
  height: 15px; /* 半圆直径 */
  border: 1px solid #f8fafc; /* 半圆边框 */
  border-radius: 50%; /* 圆形 */
  background-color: #f5f6fa; /* 背景色，与页面背景一致 */
  top: 50%;
  right: -23px; /* 定位到横线右端 */
  transform: translateY(-50%); /* 垂直居中 */
  border-left: none; /* 移除左边框，使半圆与横线自然连接 */
}
</style>

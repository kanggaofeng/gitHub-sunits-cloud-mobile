<template>
  <view class="container">
    <view class="title">权限请求示例</view>
    <view class="permission-list">
      <view v-for="item in permissionList" :key="item.key" class="permission-item">
        <view class="permission-name">{{ item.name }}</view>
        <button class="permission-btn" @click="handlePermission(item.key)">请求{{ item.name }}权限</button>
      </view>
      <view class="permission-item">
        <button class="permission-btn" @click="handleChooseImage">选择图片</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { requestPermissionHandle, getPermissionList } from './permission/permission-handler.js'

const permissionList = getPermissionList()

const handlePermission = (type) => {
  requestPermissionHandle(type)
}

const handleChooseImage = async () => {
  const hasPermission = await requestPermissionHandle('PHOTO')
  console.log(hasPermission, 'hasPermission')
  if (!hasPermission) {
    return
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.permission-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.permission-name {
  font-size: 16px;
  margin-bottom: 10px;
}

.permission-btn {
  background-color: #3870fd;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 14px;
}

.permission-btn:active {
  opacity: 0.8;
}
</style>

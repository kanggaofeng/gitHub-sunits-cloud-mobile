<template>
  <view>
    <CustomNavBar title="浏览文本" :back="true" backgroundColor="#fff" statusBarBackgroundColor="#fff" color="#000" statusBarTextStyle="black"></CustomNavBar>
    <uni-card class="view-title" :title="title">
      <text class="uni-body view-content">{{ content }}</text>
    </uni-card>
  </view>
</template>

<script>
export default {
  data() {
    return {
      title: '',
      content: '',
    }
  },
  onLoad(options) {
    this.title = options.title
    this.content = options.content
    uni.setNavigationBarTitle({
      title: options.title,
    })
  },
}
</script>

<style lang="scss" scoped>
page {
  background-color: #ffffff;
}

.view-title {
  font-weight: bold;
}

.view-content {
  font-size: 26rpx;
  padding: 12px 5px 0;
  color: #333;
  line-height: 24px;
  font-weight: normal;
}
</style>

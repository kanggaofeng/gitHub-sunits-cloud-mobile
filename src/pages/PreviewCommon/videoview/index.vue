<template>
  <div>
    <CustomNavBar title="浏览视频" :back="true" backgroundColor="#fff" statusBarBackgroundColor="#fff" color="#000" statusBarTextStyle="black"></CustomNavBar>
    <view v-if="params.url" class="videContent">
      <video class="videoDom" :src="params.url"></video>
    </view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      params: {},
      webviewStyles: {
        progress: {
          color: '#FF3333',
        },
      },
    }
  },
  props: {
    src: {
      type: [String],
      default: null,
    },
  },
  onLoad(options) {
    const decodedUrl = atob(decodeURIComponent(options.url))
    this.params.url = decodedUrl
  },
}
</script>
<style>
.videContent {
  width: 100%;
}
.videoDom {
  width: 100%;
}
</style>

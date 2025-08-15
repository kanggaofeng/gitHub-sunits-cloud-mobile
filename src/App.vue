<script>
import { requestPermissionHandle } from '@/js_sdk/system-permission/permission/permission-handler'

export default {
  onLaunch: async function () {
    console.log('App Launch')
    // 获取推送权限
    // console.log('开始请求推送权限...')
    const hasPushPermission = await requestPermissionHandle('PUSH')
    // console.log('推送权限状态:', hasPushPermission)

    if (!hasPushPermission) {
      // console.log('未获得推送权限')
      return
    }
    // console.log('已获得推送权限，准备初始化推送...')

    // 初始化推送等操作
    // #ifdef APP-PLUS
    // 这里可以添加推送初始化的代码
    // 注册推送事件监听
    plus.push.setAutoNotification(true)
    plus.push.addEventListener('click', this.handlePushClick, false)
    plus.push.addEventListener('receive', this.handlePushReceive, false)
    // #endif
  },
  onShow: async function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style lang="scss">
@import '@/static/scss/index.scss';
/* 全局引入iconfont.css */
@import '@/static/icon/iconfont.css';
@import '@/static/icon/iconfont-webapp-icon.css';
uni-tabbar {
  z-index: 2 !important;
}

/* swiper 修改workorder-scroller组件样式，确保占满content-wrapper */
:deep(.workorder-scroller) {
  height: 100%;
}

.sub-tabs-scroll {
  :deep(.uni-scroll-view) {
    overflow: visible !important;
  }
}
</style>

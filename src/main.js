import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import LbPicker from '@/components/lb-picker'
import EditDialog from '@/components/Edit-Dialog/Edit-Dialog.vue'
import registerGlobalMethods from './global-methods'
import { createUnistorage } from 'pinia-plugin-unistorage'

Vue.config.productionTip = false
App.mpType = 'app'

try {
  function isPromise(obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
  }

  // 统一 vue2 API Promise 化返回格式与 vue3 保持一致
  uni.addInterceptor({
    returnValue(res) {
      if (!isPromise(res)) {
        return res
      }
      return new Promise((resolve, reject) => {
        res.then((res) => {
          if (res[0]) {
            reject(res[0])
          } else {
            resolve(res[1])
          }
        })
      })
    },
  })
} catch (error) {}

const app = new Vue({
  ...App,
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import LbPicker from '@/components/lb-picker'
import EditDialog from '@/components/Edit-Dialog/Edit-Dialog.vue'
import pinia from '@/store'
import registerGlobalMethods from './global-methods'
import DsSvgIcon from '@/components/ds-svg-icon/DsSvgIcon.vue'
import NavBarCon from '@/components/ds-comter-navbar/NavBarCon.vue'
import CustomNavBar from '@/components/ds-comter-navbar/CustomNavBar.vue'

export function createApp() {
  const app = createSSRApp(App)
  registerGlobalMethods(app)
  app.component('lb-picker', LbPicker)
  app.component('EditDialog', EditDialog)
  app.component('DsSvgIcon', DsSvgIcon)
  app.component('NavBarCon', NavBarCon)
  app.component('CustomNavBar', CustomNavBar)
  app.use(pinia)
  return {
    app,
  }
}
// #endif

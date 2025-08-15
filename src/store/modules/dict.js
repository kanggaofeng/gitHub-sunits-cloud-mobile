import { allDictData, areaListTree } from '@/api/system/dict/data.js'
import { getProjectList as xiangMuDataApi } from '@/api/xiangMu-peiZhi/projectInfoApi.js'
const useDictStore = defineStore('dict', {
  state: () => ({
    dict: new Array(),
    xiangMuDataVx: new Array(),
    cityAllVx: new Array(),
    mockAllDictData: new Array(),
  }),
  actions: {
    // 获取字典
    getDict(_key) {
      if (_key == null && _key == '') {
        return null
      }
      try {
        for (let i = 0; i < this.dict.length; i++) {
          if (this.dict[i].key == _key) {
            return this.dict[i].value
          }
        }
      } catch (e) {
        return null
      }
    },
    // 设置字典
    setDict(_key, value) {
      if (_key !== null && _key !== '') {
        this.dict.push({
          key: _key,
          value: value,
        })
      }
    },
    // 删除字典
    removeDict(_key) {
      var bln = false
      try {
        for (let i = 0; i < this.dict.length; i++) {
          if (this.dict[i].key == _key) {
            this.dict.splice(i, 1)
            return true
          }
        }
      } catch (e) {
        bln = false
      }
      return bln
    },
    // 清空字典
    cleanDict() {
      this.dict = new Array()
    },
    // 初始字典
    initDict() {},
    // 获取所有的字典值
    getallDictData() {
      return new Promise((resolve, reject) => {
        allDictData()
          .then((res) => {
            this.mockAllDictData = res.data
            resolve(res)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // 获取项目
    getAllProgectvxFn() {
      return new Promise((resolve, reject) => {
        xiangMuDataApi()
          .then((res) => {
            this.xiangMuDataVx = []
            res.rows.forEach((p) => {
              this.xiangMuDataVx.push({ label: p.projectShortname, value: p.id, ...p })
            })
            resolve(this.xiangMuDataVx)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // 获取城市
    getAllCityvxFn() {
      return new Promise((resolve, reject) => {
        areaListTree()
          .then((res) => {
            this.cityAllVx = []
            this.cityAllVx = res.data.children
            resolve(res.data.children)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
  },
  unistorage: true, // 开启后对 state 的数据读写都将持久化
})

export default useDictStore

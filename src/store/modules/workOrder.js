const useWorkOrderStore = defineStore('workOrder', {
  state: () => ({
    basicInfo: null,
    isWorkerDetailRefresh: false, // 工单详情页刷新
    isWorkerListRefresh: false, // 工单列表页刷新
    izShowChangeContractBtn: false, //头部-改约按钮
    izShowAppointFloatingWin: false, //头部-预约记录按钮
    workOrderDetailConfig: null,
  }),
  actions: {
    setBasicInfo(data) {
      this.basicInfo = data
    },
    setButtonStatus(izShowChangeContractBtn, izShowAppointFloatingWin) {
      this.izShowChangeContractBtn = izShowChangeContractBtn
      this.izShowAppointFloatingWin = izShowAppointFloatingWin
    },
  },
  persist: {
    paths: ['basicInfo', 'isWorkerDetailRefresh', 'isWorkerListRefresh'],
    unistorage: true, // 开启后对 state 的数据读写都将持久化
  },
})

export default useWorkOrderStore

/**
 * 通用滚动列表钩子函数
 * 提供滚动加载、分页、刷新以及缓存功能
 */

// 全局缓存对象
const scrollerCache = {}

// 清除所有scroller缓存的静态方法
export const clearAllScrollerCache = () => {
  Object.keys(scrollerCache).forEach((key) => {
    delete scrollerCache[key]
  })
}

export function useScroller(options = {}) {
  // 默认选项与合并
  const opts = {
    pageSize: 10,
    initialPage: 1,
    fetchService: null,
    immediate: true,
    cacheKey: '',
    useCache: false,
    ...options,
  }

  // 列表状态
  const list = ref([])
  const loadingStatus = ref('more')
  const isLoadingData = ref(false)
  const isEmpty = ref(false)
  const isRefreshing = ref(false)
  const pagination = ref({ page: opts.initialPage, pageSize: opts.pageSize })
  const queryParams = ref({})
  const activeCacheKey = ref('')

  // 缓存操作
  const getCurrentCacheKey = () => {
    const key = typeof opts.cacheKey === 'function' ? opts.cacheKey() : opts.cacheKey || ''
    activeCacheKey.value = key
    return key
  }

  const clearCache = (key) => {
    const cacheKey = key || activeCacheKey.value
    if (cacheKey && scrollerCache[cacheKey]) delete scrollerCache[cacheKey]
  }

  const updateCache = (key, data) => key && (scrollerCache[key] = data)

  const clearAllCache = () => {
    Object.keys(scrollerCache).forEach((key) => delete scrollerCache[key])
  }

  // 重置操作
  const resetPagination = () => {
    pagination.value.page = opts.initialPage
    list.value = []
    loadingStatus.value = 'more'
    isEmpty.value = false
  }

  const reset = () => {
    resetPagination()
    clearCache()
  }

  // 从缓存恢复数据
  const restoreFromCache = (cacheKey) => {
    if (!opts.useCache || !cacheKey || !scrollerCache[cacheKey]?.list?.length) return false

    const cachedData = scrollerCache[cacheKey]
    list.value = [...cachedData.list]
    loadingStatus.value = cachedData.loadingStatus || 'more'
    isEmpty.value = list.value.length === 0

    if (cachedData.pagination) {
      pagination.value = { ...pagination.value, ...cachedData.pagination }
    }

    return true
  }

  // 加载列表数据
  const loadData = async (forceReset = false) => {
    if (!opts.fetchService) return

    const cacheKey = getCurrentCacheKey()

    // 处理重置或加载状态
    if (forceReset) {
      resetPagination()
    } else if (loadingStatus.value === 'noMore' || loadingStatus.value === 'loading') {
      return
    }

    // 检查缓存
    if (!forceReset && opts.useCache && cacheKey && scrollerCache[cacheKey]?.list?.length > 0) {
      const cachedData = scrollerCache[cacheKey]
      const currentPage = pagination.value.page
      const cachedPages = Math.ceil(cachedData.list.length / pagination.value.pageSize)

      // 如果有足够缓存数据，直接返回
      if (currentPage <= cachedPages) {
        restoreFromCache(cacheKey)
        return Promise.resolve({ code: 200, fromCache: true })
      }

      // 加载更多页时，保留已缓存数据
      if (currentPage > cachedPages) {
        list.value = [...cachedData.list]
      }
    }

    try {
      isLoadingData.value = true
      loadingStatus.value = 'loading'

      const params = {
        pageNum: pagination.value.page,
        pageSize: pagination.value.pageSize,
        ...queryParams.value,
      }

      const res = await opts.fetchService(params)

      if (res?.code === 200 && res.rows) {
        const newItems = Array.isArray(res.rows) ? res.rows : []

        // 追加或替换数据
        if (pagination.value.page === opts.initialPage) {
          list.value = newItems
        } else {
          list.value = [...list.value, ...newItems]
        }

        // 更新状态
        loadingStatus.value = !newItems.length || pagination.value.page * pagination.value.pageSize >= res.total ? 'noMore' : 'more'
        isEmpty.value = list.value.length === 0

        // 缓存数据
        if (opts.useCache && cacheKey) {
          updateCache(cacheKey, {
            list: [...list.value],
            loadingStatus: loadingStatus.value,
            queryParams: { ...queryParams.value },
            pagination: { ...pagination.value },
            timestamp: Date.now(),
          })
        }
      } else {
        list.value = []
        isEmpty.value = true
      }

      return res
    } catch (error) {
      console.error('加载数据失败:', error)
      list.value = []
      isEmpty.value = true
    } finally {
      isLoadingData.value = false
      isRefreshing.value = false
    }
  }

  // 加载更多
  const loadMore = () => {
    if (loadingStatus.value !== 'loading') {
      pagination.value.page++
      return loadData()
    }
  }

  // 刷新数据
  const refresh = async (callback) => {
    if (opts.isAllRefresh) {
      clearCache(getCurrentCacheKey())
    }
    isRefreshing.value = true
    try {
      return await loadData(true)
    } finally {
      isRefreshing.value = false
      callback?.()
    }
  }
  const isAllRefresh = () => {
    return opts.isAllRefresh || false
  }

  // 更新查询参数
  const updateQueryParams = (params, preserveCache = false) => {
    if (!params || typeof params !== 'object') return Promise.resolve()

    // 直接更新参数、清缓存并刷新，不检测参数变化
    queryParams.value = { ...queryParams.value, ...params }
    clearCache(getCurrentCacheKey())
    return refresh()
  }

  // 切换标签
  const switchTab = (tabParams) => {
    queryParams.value = { ...queryParams.value, ...tabParams }
    const newCacheKey = getCurrentCacheKey()

    // 尝试从缓存恢复
    if (restoreFromCache(newCacheKey)) {
      return Promise.resolve({ code: 200, fromCache: true })
    }

    // 无缓存时加载新数据
    resetPagination()
    return loadData()
  }

  // 初始化
  onMounted(() => {
    if (!Array.isArray(list.value)) list.value = []
    getCurrentCacheKey()

    if (opts.immediate && opts.fetchService) {
      nextTick(() => loadData())
    }
  })

  function removeItemById(id) {
    list.value = list.value.filter((item) => item.id !== id)
    const cacheKey = getCurrentCacheKey()
    if (opts.useCache && cacheKey && scrollerCache[cacheKey]) {
      scrollerCache[cacheKey].list = scrollerCache[cacheKey].list.filter((item) => item.id !== id)
    }
  }

  // 对外暴露的API
  return {
    // 状态
    get list() {
      return list.value
    },
    get loadingStatus() {
      return loadingStatus.value || 'more'
    },
    get loading() {
      return !!isLoadingData.value
    },
    get isEmpty() {
      return !!isEmpty.value
    },
    get isRefreshing() {
      return !!isRefreshing.value
    },
    pagination,
    queryParams,

    // 方法
    loadData,
    loadMore,
    refresh,
    reset,
    resetPagination,
    updateQueryParams,
    clearCache,
    clearAllCache,
    switchTab,
    getCurrentCacheKey,
    removeItemById,
    isAllRefresh,
  }
}

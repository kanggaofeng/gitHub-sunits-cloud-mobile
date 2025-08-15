const jumpRouteMap = {
  //工单详情页
  '1': '/pages/workorder-detail/workorder-detail'
}

function getRouteByType(jumpRouteType) {
  return jumpRouteMap[jumpRouteType]
}
// 处理点击事件
export function handlePushClick(msg) {
  console.log('msg click', msg)
  let payload = msg.payload
  if (typeof payload == 'string') {
    try {
      payload = JSON.parse(payload)
    } catch (e) {
      payload = {}
    }
  }
  //需要路由跳转
  if (payload.izJump == '1') {
    const jumpRouteType = payload.jumpRouteType
    const businessId = payload.businessId
    if (!jumpRouteType || !businessId) {
      console.warn('缺少必须要参数', { jumpRouteType, businessId })
      return
    }
    const route = getRouteByType(jumpRouteType)
    if (!route) {
      return
    }
    //todo judge user loggined
    const url = `${route}?id=${encodeURIComponent(businessId)}`
    const delay = payload.delay ? parseInt(payload.delay, 10) : 200
    setTimeout(() => {
      uni.navigateTo({ url: url })
    }, delay)
  }  
}
//处理接收事件
export function handlePushReceive(msg) {
  console.log('msg receive', msg)
  let platform = uni.getSystemInfoSync().platform
  console.log('platform', platform)
  let payload = msg.payload
  if (typeof payload == 'string') {
    try {
      payload = JSON.parse(payload)
    } catch(e) {
      payload = {}
    }
  }
  const action = payload.action
  if (action == 'notice') {
    const content = msg.content
    const title = msg.title
    if(content && title){
      plus.push.createMessage(
        content,
        payload,
        {title: title, cover: false}
      )
    }
  } else if (action == 'reload') {
    
  }
}
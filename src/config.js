// 应用全局配置
const config = {
  // API配置
  api: {
    // 环境配置
    env: {
      // 测试环境
      development: {
        baseUrl: 'http://gateway.sc.sunits.net',
        // baseUrl: 'http://172.18.35.107:8080',
        apiPrefix: '/dev-api',
      },
      // 开发机器
      production: {
        baseUrl: 'http://gateway.sc.sunits.net',
        apiPrefix: '/prod-api',
      },
      // 正式环境
      formal: {
        baseUrl: 'http://gateway.sc.sunits.com',
        apiPrefix: '/stage-api',
      },
    },
    //  获取对应环境变量
    devBaseUrl: '/dev-api',
    // devBaseUrl: '/prod-api',
  },
  // 应用信息
  appInfo: {
    // 应用名称
    name: 'ruoyi-app-vue3',
    // 应用版本
    version: '1.1.0',
    // 应用logo
    logo: '/static/logo.png',
    // 官方网站
    site_url: 'http://ruoyi.vip',
    // 政策协议
    agreements: [
      {
        title: '隐私政策',
        url: 'https://ruoyi.vip/protocol.html',
      },
      {
        title: '用户服务协议',
        url: 'https://ruoyi.vip/protocol.html',
      },
    ],
  },
}

export default config

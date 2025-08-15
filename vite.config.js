import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
// 导入应用配置
import appConfig from './src/config.js'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
      ],
      imports: [
        'vue',
        'uni-app',
        'pinia',
        {
          // No longer needed with Pinia
        },
      ],
      dts: 'typings/auto-imports.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, './'),
      '@': resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: {
      // plugins: [
      // 	require("postcss-pxtorpx-pro")({
      // 		// 转化的单位
      // 		unit: "rpx",
      // 		// 单位精度
      // 		unitPrecision: 5,
      // 		// 不需要处理的css选择器
      // 		selectorBlackList: [],
      // 		// 不需要转化的css属性
      // 		propBlackList: [],
      // 		// 直接修改px，还是新加一条css规则
      // 		replace: true,
      // 		// 是否匹配媒介查询的px
      // 		mediaQuery: false,
      // 		// 需要转化的最小的pixel值，低于该值的px单位不做转化
      // 		minPixelValue: 2,
      // 		// 不处理的文件
      // 		exclude: /node_modules|componentswe/gi,
      // 		// 转化函数
      // 		// 视口375px
      // 		transform: (x) => 2 * x,
      // 	}),
      // ],
    },
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
  server: {
    port: 9000,
    host: true,
    open: true,
    proxy: {
      [appConfig.api.env.development.apiPrefix]: {
        target: appConfig.api.env.development.baseUrl,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/dev-api/, ''),
      },
      [appConfig.api.env.formal.apiPrefix]: {
        target: appConfig.api.env.formal.baseUrl,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/stage-api/, ''),
      },
      [appConfig.api.env.production.apiPrefix]: {
        target: appConfig.api.env.production.baseUrl,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/prod-api/, ''),
      },
    },
  },
})

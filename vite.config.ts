import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.cn/vite6-cn/config/
export default defineConfig({
  plugins: [
    vue(),
    // unplugin 系列: 图标按需加载工具
    Icons(),
    // unplugin 系列: ref等自动导入
    AutoImport({
      imports: [ 'vue', 'vue-router']
    }),
    // unplugin 系列: vue组件自动导入
    Components({
      resolvers: [
        IconsResolver()
      ]
    })
  ],
  server: {
    port: 3000,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

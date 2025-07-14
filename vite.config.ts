import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.cn/vite6-cn/config/
export default defineConfig({
  plugins: [
    vue(),
    // 图标按需加载工具
    Icons({}),
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

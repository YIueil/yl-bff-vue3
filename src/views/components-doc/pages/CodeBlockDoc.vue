<script setup lang="ts">
import CodeBlock from '@/components/CodeBlock.vue'

const usageSample = `<CodeBlock
  :code="source"
  language="xml"
  title="示例.vue"
/>`

const vueSample = `<YlModal :visible="show" :show-footer="false">
  <template v-slot:header>标题</template>
  <template v-slot:body>
    <p>内容</p>
  </template>
</YlModal>`

const tsSample = `import { ref } from 'vue'

const count = ref(0)
function increment() {
  count.value++
}`

const jsSample = `import { Modal } from '@/utils/modal-manager'

Modal.open({
  key: 'demo',
  title: '示例',
  component: AboutView
})`

const jsonSample = `{
  "name": "yl-bff-vue3",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --build --force && vite build"
  }
}`

const bashSample = `# 安装依赖
pnpm install

# 启动开发服务器（固定端口 3000）
pnpm run dev`

const apiColumns = [
  { title: '属性', dataIndex: 'name', key: 'name', width: 140 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 220 },
  { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
  { title: '说明', dataIndex: 'description', key: 'description' }
]

const apiRows = [
  { key: 'code', name: 'code', type: 'string', default: '—（必填）', description: '待高亮的源码字符串' },
  { key: 'language', name: 'language', type: 'string', default: "'xml'", description: '语言标识；vue 片段用 xml，纯 TS 用 typescript' },
  { key: 'showCopy', name: 'showCopy', type: 'boolean', default: 'true', description: '是否在顶部栏显示复制按钮' },
  { key: 'title', name: 'title', type: 'string', default: "''", description: '顶部栏标题，缺省时显示语言名' }
]
</script>

<template>
  <main class="doc-page">
    <header class="doc-page-hero">
      <a-typography-paragraph class="doc-page-eyebrow">组件文档 / 代码块</a-typography-paragraph>
      <a-typography-title id="overview" data-anchor="overview" :level="1" class="doc-page-title">代码块 CodeBlock</a-typography-title>
      <a-typography-paragraph class="doc-page-summary">
        基于 <code>highlight.js</code> 的语法高亮代码块组件，支持多种语言与一键复制。
      </a-typography-paragraph>
    </header>

    <a-alert
      type="info"
      show-icon
      class="doc-page-alert"
      message="何时使用 / 何时不用"
      description="文档或示例中需要展示源码时使用；纯文本日志请使用普通元素，避免误用高亮样式。"
    />

    <a-typography-title id="api" data-anchor="api" :level="2">API</a-typography-title>
    <a-table
      :columns="apiColumns"
      :data-source="apiRows"
      :pagination="false"
      size="middle"
      class="doc-table"
    />

    <a-typography-title id="usage" data-anchor="usage" :level="2">基础用法</a-typography-title>
    <a-typography-paragraph>
      在组件中显式引入，传入源码字符串与语言即可；顶部栏默认显示语言名并提供复制按钮。
    </a-typography-paragraph>
    <div class="doc-demo">
      <CodeBlock :code="usageSample" language="xml" />
    </div>

    <a-typography-title id="languages" data-anchor="languages" :level="2">语言示例</a-typography-title>
    <a-typography-paragraph>
      通过 <code>language</code> 指定语言，已注册 <code>xml</code> / <code>typescript</code> /
      <code>javascript</code> / <code>json</code> / <code>bash</code>。
    </a-typography-paragraph>

    <div class="doc-demo">
      <a-typography-title :level="4">Vue 片段（xml）</a-typography-title>
      <CodeBlock :code="vueSample" language="xml" />
    </div>
    <div class="doc-demo">
      <a-typography-title :level="4">TypeScript（typescript）</a-typography-title>
      <CodeBlock :code="tsSample" language="typescript" />
    </div>
    <div class="doc-demo">
      <a-typography-title :level="4">JavaScript（javascript）</a-typography-title>
      <CodeBlock :code="jsSample" language="javascript" />
    </div>
    <div class="doc-demo">
      <a-typography-title :level="4">JSON（json）</a-typography-title>
      <CodeBlock :code="jsonSample" language="json" />
    </div>
    <div class="doc-demo">
      <a-typography-title :level="4">Shell（bash）</a-typography-title>
      <CodeBlock :code="bashSample" language="bash" />
    </div>

    <a-typography-title id="no-copy" data-anchor="no-copy" :level="2">隐藏复制按钮</a-typography-title>
    <a-typography-paragraph>
      设置 <code>:show-copy="false"</code> 可隐藏复制按钮，适合仅展示、不需取用的场景。
    </a-typography-paragraph>
    <div class="doc-demo">
      <CodeBlock :code="jsonSample" language="json" :show-copy="false" />
    </div>

    <a-typography-title id="title" data-anchor="title" :level="2">自定义标题</a-typography-title>
    <a-typography-paragraph>
      通过 <code>title</code> 在顶部栏显示文件名或说明，缺省时回退为语言名。
    </a-typography-paragraph>
    <div class="doc-demo">
      <CodeBlock :code="vueSample" language="xml" title="示例.vue" />
    </div>

    <a-typography-title id="security" data-anchor="security" :level="2">安全说明</a-typography-title>
    <a-alert
      type="warning"
      show-icon
      class="doc-page-alert"
      message="渲染安全"
      description="源码经 highlight.js 转义后渲染，不会执行其中的脚本；源码字符串仍由开发者维护，不要传入未清洗的用户输入。"
    />

    <a-typography-title id="links" data-anchor="links" :level="2">相关链接</a-typography-title>
    <a-typography-paragraph>
      <ul>
        <li><code>src/components/CodeBlock.vue</code> — 组件实现</li>
        <li><code>src/core/hljs.ts</code> — highlight.js 语言注册</li>
      </ul>
    </a-typography-paragraph>
  </main>
</template>

<style scoped>
.doc-page {
  width: min(960px, 100%);
  margin: 0 auto;
}

.doc-page-alert {
  margin: 16px 0 24px;
}

.doc-demo {
  margin-bottom: 24px;
}

.doc-table {
  margin-bottom: 24px;
}
</style>

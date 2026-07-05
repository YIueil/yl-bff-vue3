<script setup lang="ts">
import { ref } from 'vue'

const basicTab = ref<'preview' | 'code'>('preview')

const baseSource = `<button class="button button-primary">主要按钮</button>
<button class="button button-danger">警告</button>
<button class="button button-outline">边框</button>
<button class="button button-ghost">幽灵</button>`

const sizeSource = `<button class="button button-primary button-large">大</button>
<button class="button button-primary">标准</button>
<button class="button button-primary button-small">小</button>`

const apiColumns = [
  { title: '修饰类', dataIndex: 'modifier', key: 'modifier', width: 220 },
  { title: '类型', dataIndex: 'kind', key: 'kind', width: 120 },
  { title: '说明', dataIndex: 'description', key: 'description' }
]

const apiRows = [
  { key: 'primary', modifier: 'button-primary', kind: '视觉', description: '主色调，蓝色背景白色文字，用于主操作' },
  { key: 'danger', modifier: 'button-danger', kind: '视觉', description: '警示色调，红色背景，用于破坏性操作' },
  { key: 'outline', modifier: 'button-outline', kind: '视觉', description: '透明背景带边框，用于次要操作' },
  { key: 'ghost', modifier: 'button-ghost', kind: '视觉', description: '透明背景无边框，常用于工具栏' },
  { key: 'large', modifier: 'button-large', kind: '尺寸', description: '加大尺寸，常用于首屏 CTA' },
  { key: 'small', modifier: 'button-small', kind: '尺寸', description: '缩小尺寸，常用于密集列表/工具条' }
]
</script>

<template>
  <main class="doc-page">
    <header class="doc-page-hero">
      <p class="doc-page-eyebrow">组件文档 / 按钮</p>
      <h1 data-anchor="overview" class="doc-page-title">按钮 Button</h1>
      <p class="doc-page-summary">
        基于 <code>.button</code> 基类的轻量按钮样式，通过修饰类组合视觉与尺寸。
        与 antd 按钮（<code>&lt;a-button&gt;</code>）并存使用，按需选用。
      </p>
    </header>

    <a-alert
      type="info"
      show-icon
      class="doc-page-alert"
      message="何时使用 / 何时不用"
      description="仅需要简单静态样式时使用自研 button；需要 loading / disabled / icon / 复杂尺寸时使用 antd <a-button>。"
    />

    <a-typography-title :id="undefined" data-anchor="basic" :level="2">基础示例</a-typography-title>
    <a-tabs v-model:active-key="basicTab">
      <a-tab-pane key="preview" tab="预览">
        <a-card class="doc-card-preview">
          <button class="button button-primary">主要按钮</button>
          <button class="button button-danger">警告</button>
          <button class="button button-outline">边框</button>
          <button class="button button-ghost">幽灵</button>
          <button>原始</button>
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="code" tab="代码">
        <pre class="doc-pre"><code>{{ baseSource }}</code></pre>
      </a-tab-pane>
    </a-tabs>

    <a-typography-title :id="undefined" data-anchor="size" :level="2">尺寸</a-typography-title>
    <a-tabs>
      <a-tab-pane key="preview" tab="预览">
        <a-card class="doc-card-preview">
          <button class="button button-primary button-large">大</button>
          <button class="button button-primary">标准</button>
          <button class="button button-primary button-small">小</button>
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="code" tab="代码">
        <pre class="doc-pre"><code>{{ sizeSource }}</code></pre>
      </a-tab-pane>
    </a-tabs>

    <a-typography-title :id="undefined" data-anchor="api" :level="2">API</a-typography-title>
    <a-typography-paragraph>
      通过组合修饰类实现样式，无独立 props API。
    </a-typography-paragraph>
    <a-table
      :columns="apiColumns"
      :data-source="apiRows"
      :pagination="false"
      size="middle"
      class="doc-table"
    />

    <a-typography-title :id="undefined" data-anchor="links" :level="2">相关链接</a-typography-title>
    <a-typography-paragraph>
      <ul>
        <li><code>src/assets/css/button.css</code> — 修饰类实现源码</li>
        <li><code>src/assets/main.css</code> — 全局样式入口</li>
        <li><RouterLink to="/components/icon">图标文档</RouterLink>（按钮内图标组合）</li>
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

.doc-card-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.doc-table {
  margin-bottom: 24px;
}

.doc-pre {
  padding: 16px;
  overflow-x: auto;
  color: #dbe6ff;
  background: #172033;
  border: 1px solid #26324a;
  border-radius: 8px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
}
</style>

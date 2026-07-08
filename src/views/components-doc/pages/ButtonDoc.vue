<script setup lang="ts">
import CodeBlock from '@/components/CodeBlock.vue'

const basicTab = ref<'preview' | 'code'>('preview')

const typeSource = `<a-button type="primary">主要按钮</a-button>
<a-button type="danger">危险按钮</a-button>
<a-button>默认按钮</a-button>
<a-button type="dashed">虚线按钮</a-button>
<a-button type="link">链接按钮</a-button>
<a-button type="text">文字按钮</a-button>`

const sizeSource = `<a-button type="primary" size="large">大</a-button>
<a-button type="primary" size="middle">中</a-button>
<a-button type="primary" size="small">小</a-button>`

const stateSource = `<a-button type="primary" disabled>禁用</a-button>
<a-button type="primary" loading>加载中</a-button>
<a-button type="primary" block>块级按钮</a-button>`

const apiColumns = [
  { title: '属性', dataIndex: 'name', key: 'name', width: 140 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 220 },
  { title: '默认值', dataIndex: 'default', key: 'default', width: 120 },
  { title: '说明', dataIndex: 'description', key: 'description' }
]

const apiRows = [
  { key: 'type', name: 'type', type: "'default' | 'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'danger'", default: "'default'", description: '按钮类型，决定视觉风格' },
  { key: 'size', name: 'size', type: "'large' | 'middle' | 'small'", default: "'middle'", description: '按钮尺寸' },
  { key: 'disabled', name: 'disabled', type: 'boolean', default: 'false', description: '是否禁用' },
  { key: 'loading', name: 'loading', type: 'boolean | { delay: number }', default: 'false', description: '加载状态，可设 delay 防止闪烁' },
  { key: 'block', name: 'block', type: 'boolean', default: 'false', description: '块级按钮，宽度撑满父容器' },
  { key: 'shape', name: 'shape', type: "'default' | 'circle' | 'round'", default: "'default'", description: '按钮形状' },
  { key: 'href', name: 'href', type: 'string', default: '—', description: '点击跳转链接，渲染为 <a>' },
  { key: 'icon', name: 'icon', type: 'VNode | () => VNode', default: '—', description: '按钮图标，建议使用 @ant-design/icons-vue' },
  { key: 'onClick', name: '@click', type: '(event) => void', default: '—', description: '点击事件回调' }
]
</script>

<template>
  <main class="doc-page">
    <header class="doc-page-hero">
      <a-typography-paragraph class="doc-page-eyebrow">组件文档 / 按钮</a-typography-paragraph>
      <a-typography-title id="overview" data-anchor="overview" :level="1" class="doc-page-title">按钮 Button</a-typography-title>
      <a-typography-paragraph class="doc-page-summary">
        基于 antd-vue <code>&lt;a-button&gt;</code> 的统一按钮组件，支持多种 type / size / shape / loading 等。
      </a-typography-paragraph>
    </header>

    <a-alert
      type="info"
      show-icon
      class="doc-page-alert"
      message="何时使用 / 何时不用"
      description="所有按钮统一使用 a-button；如需 loading / disabled / icon / 复杂尺寸，使用 a-button 的对应 props。"
    />

    <a-typography-title id="type" data-anchor="type" :level="2">类型</a-typography-title>
    <a-tabs v-model:active-key="basicTab">
      <a-tab-pane key="preview" tab="预览">
        <a-card class="doc-card-preview">
          <a-button type="primary">主要按钮</a-button>
          <a-button type="danger">危险按钮</a-button>
          <a-button>默认按钮</a-button>
          <a-button type="dashed">虚线按钮</a-button>
          <a-button type="link">链接按钮</a-button>
          <a-button type="text">文字按钮</a-button>
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="code" tab="代码">
        <CodeBlock :code="typeSource" language="xml" />
      </a-tab-pane>
    </a-tabs>

    <a-typography-title id="size" data-anchor="size" :level="2">尺寸</a-typography-title>
    <a-tabs>
      <a-tab-pane key="preview" tab="预览">
        <a-card class="doc-card-preview">
          <a-button type="primary" size="large">大</a-button>
          <a-button type="primary" size="middle">中</a-button>
          <a-button type="primary" size="small">小</a-button>
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="code" tab="代码">
        <CodeBlock :code="sizeSource" language="xml" />
      </a-tab-pane>
    </a-tabs>

    <a-typography-title id="state" data-anchor="state" :level="2">状态</a-typography-title>
    <a-tabs>
      <a-tab-pane key="preview" tab="预览">
        <a-space>
          <a-button type="primary" disabled>禁用</a-button>
          <a-button type="primary" loading>加载中</a-button>
          <a-button type="primary" block>块级按钮</a-button>
        </a-space>
      </a-tab-pane>
      <a-tab-pane key="code" tab="代码">
        <CodeBlock :code="stateSource" language="xml" />
      </a-tab-pane>
    </a-tabs>

    <a-typography-title id="api" data-anchor="api" :level="2">API</a-typography-title>
    <a-typography-paragraph>
      完整 API 见
      <a href="https://www.antdv.com/components/button-cn" target="_blank">antd-vue Button 文档</a>。
    </a-typography-paragraph>
    <a-table
      :columns="apiColumns"
      :data-source="apiRows"
      :pagination="false"
      size="middle"
      class="doc-table"
    />

    <a-typography-title id="links" data-anchor="links" :level="2">相关链接</a-typography-title>
    <a-typography-paragraph>
      <ul>
        <li><RouterLink to="/components/icon">图标文档</RouterLink>（按钮内图标组合）</li>
        <li><RouterLink to="/components/modal">Modal 文档</RouterLink>（footer 按钮事件）</li>
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
</style>

<script setup lang="ts">
const capabilities = [
  {
    key: 'icon',
    name: '图标 Icon',
    path: '/components/icon',
    summary: 'Iconify 在线 / 离线按需 / 自定义单色多色'
  },
  {
    key: 'modal',
    name: '模态框 Modal',
    path: '/components/modal',
    summary: '声明式 + API + 选项式 + 可信 HTML + 拖拽缩放'
  },
  {
    key: 'button',
    name: '按钮 Button',
    path: '/components/button',
    summary: '基类 .button 加修饰类组合视觉与尺寸'
  },
  {
    key: 'echarts',
    name: '图表 ECharts',
    path: '/components/echarts',
    summary: '按需注册 + mounted/init + ResizeObserver + dispose'
  },
  {
    key: 'draggable',
    name: '列表拖拽 Draggable',
    path: '/components/draggable',
    summary: 'vue-draggable-plus 列表排序与分组'
  },
  {
    key: 'drag-resize',
    name: '元素拖拽缩放 DragResize',
    path: '/components/drag-resize',
    summary: 'vue3-draggable-resizable 单元素拖拽与缩放'
  }
]
</script>

<template>
  <main class="doc-page">
    <header class="doc-page-hero">
      <a-typography-paragraph class="doc-page-eyebrow">组件文档 / 关于</a-typography-paragraph>
      <a-typography-title id="overview" data-anchor="overview" :level="1" class="doc-page-title">关于 About</a-typography-title>
      <a-typography-paragraph class="doc-page-summary">
        yl-bff-vue3 是 YIueil 的 Vue 3 前端框架原型 / 演示集合，目的是以最小代价验证
        Iconify / Modal / ECharts / 拖拽等核心能力的集成方式。
      </a-typography-paragraph>
    </header>

    <a-typography-title id="stack" data-anchor="stack" :level="2">技术栈</a-typography-title>
    <a-descriptions :column="2" bordered size="small" class="doc-desc">
      <a-descriptions-item label="框架">Vue 3.4 + TypeScript 5.4</a-descriptions-item>
      <a-descriptions-item label="构建">Vite 6.3</a-descriptions-item>
      <a-descriptions-item label="状态">Pinia 2</a-descriptions-item>
      <a-descriptions-item label="路由">Vue Router 4</a-descriptions-item>
      <a-descriptions-item label="UI">antd-vue 4.2（全量）</a-descriptions-item>
      <a-descriptions-item label="工具">VueUse、Iconify、vue-draggable-plus、vue3-draggable-resizable</a-descriptions-item>
      <a-descriptions-item label="包管理">pnpm 10.13.1</a-descriptions-item>
      <a-descriptions-item label="Node">20.14.5</a-descriptions-item>
    </a-descriptions>

    <a-typography-title id="capabilities" data-anchor="capabilities" :level="2">能力索引</a-typography-title>
    <a-list :data-source="capabilities" :bordered="true" class="doc-cap-list">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta :title="item.name" :description="item.summary">
            <template #avatar>
              <span class="doc-cap-dot"></span>
            </template>
          </a-list-item-meta>
          <RouterLink :to="item.path">查看文档 →</RouterLink>
        </a-list-item>
      </template>
    </a-list>

    <a-typography-title id="workflow" data-anchor="workflow" :level="2">开发约定</a-typography-title>
    <a-typography-paragraph>
      修改运行时代码前请阅读 <code>AGENTS.md</code>：所有实现类任务先在 <code>docs/</code>
      写计划，由开发者亲自提交后切到 <code>.worktree/codex-*</code> 分支实施，
      <code>git commit</code> 使用临时身份 <code>codex &lt;codex@openai.com&gt;</code>，
      完成后禁止自动合并，需先汇报。
    </a-typography-paragraph>

    <a-typography-title id="links" data-anchor="links" :level="2">相关链接</a-typography-title>
    <a-typography-paragraph>
      <ul>
        <li><code>README.md</code> — 项目说明</li>
        <li><code>AGENTS.md</code> — AI 协作规范</li>
        <li><code>TODO.md</code> — 任务清单</li>
        <li><code>docs/</code> — 实现计划归档</li>
      </ul>
    </a-typography-paragraph>
  </main>
</template>

<style scoped>
.doc-page {
  width: min(960px, 100%);
  margin: 0 auto;
}

.doc-desc {
  margin-bottom: 24px;
}

.doc-cap-list {
  margin-bottom: 24px;
}

.doc-cap-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  background: #3157d5;
  border-radius: 50%;
}
</style>

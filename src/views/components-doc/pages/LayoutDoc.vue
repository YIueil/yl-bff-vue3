<script setup lang="ts">
import ThreeColumnDashboardDemo from '../components/ThreeColumnDashboardDemo.vue'

const layoutColumns = [
  { title: '布局', dataIndex: 'name', key: 'name', width: 180 },
  { title: '结构', dataIndex: 'structure', key: 'structure', width: 260 },
  { title: '适用场景', dataIndex: 'usage', key: 'usage' }
]

const layoutRows = [
  {
    key: 'doc',
    name: 'DocLayout',
    structure: 'Header + 左侧文档导航 + 内容区 + 右侧目录',
    usage: '组件文档、说明页和需要页内目录的长文档页面'
  },
  {
    key: 'three-column',
    name: 'ThreeColumnLayout',
    structure: '左侧 sider + topbar/content + 右侧 sider',
    usage: '后台工作台、运营 Dashboard、需要左右辅助面板的应用页面'
  }
]

const propColumns = [
  { title: '名称', dataIndex: 'name', key: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 180 },
  { title: '默认值', dataIndex: 'default', key: 'default', width: 100 },
  { title: '说明', dataIndex: 'description', key: 'description' }
]

const propRows = [
  {
    key: 'leftOpen',
    name: 'leftOpen',
    type: 'boolean',
    default: '-',
    description: '左侧栏是否展开，由调用方持有状态'
  },
  {
    key: 'rightOpen',
    name: 'rightOpen',
    type: 'boolean',
    default: '-',
    description: '右侧栏是否展开，由调用方持有状态'
  },
  {
    key: 'isMobile',
    name: 'isMobile',
    type: 'boolean',
    default: '-',
    description: '是否启用移动端浮层模式，浮层模式下侧栏不挤压内容'
  },
  {
    key: 'leftWidth',
    name: 'leftWidth',
    type: 'number',
    default: '260',
    description: '左侧栏桌面端宽度，单位 px'
  },
  {
    key: 'rightWidth',
    name: 'rightWidth',
    type: 'number',
    default: '300',
    description: '右侧栏桌面端宽度，单位 px'
  }
]

const eventRows = [
  { key: 'toggleLeft', name: 'toggle-left', type: '() => void', description: '请求切换左侧栏' },
  { key: 'toggleRight', name: 'toggle-right', type: '() => void', description: '请求切换右侧栏' },
  { key: 'closeLeft', name: 'close-left', type: '() => void', description: '请求关闭左侧栏' },
  { key: 'closeRight', name: 'close-right', type: '() => void', description: '请求关闭右侧栏' }
]

const slotRows = [
  { key: 'left', name: 'left', type: 'slot', description: '左侧 sider 内容' },
  {
    key: 'topbar',
    name: 'topbar',
    type: 'slot props',
    description: '顶部栏内容，提供 leftOpen、rightOpen、toggleLeft、toggleRight'
  },
  { key: 'default', name: 'default', type: 'slot', description: '主内容区' },
  { key: 'right', name: 'right', type: 'slot', description: '右侧 sider 内容' }
]
</script>

<template>
  <main class="doc-page layout-doc-page">
    <header class="doc-page-hero">
      <a-typography-paragraph class="doc-page-eyebrow">组件文档 / 布局</a-typography-paragraph>
      <a-typography-title id="overview" data-anchor="overview" :level="1" class="doc-page-title">
        布局 Layout
      </a-typography-title>
      <a-typography-paragraph class="doc-page-summary">
        当前项目保留两类布局：文档站使用的 <code>DocLayout</code>，以及面向后台工作台场景的
        <code>ThreeColumnLayout</code>。两者职责独立，避免文档页壳和应用页壳互相耦合。
      </a-typography-paragraph>
    </header>

    <a-alert
      type="info"
      show-icon
      class="doc-page-alert"
      message="布局职责"
      description="布局组件只负责区域结构、响应式和折叠交互入口；导航项、业务卡片、通知和图表数据留在页面或示例组件中维护。"
    />

    <a-typography-title id="layouts" data-anchor="layouts" :level="2">
      当前布局
    </a-typography-title>
    <a-table
      :columns="layoutColumns"
      :data-source="layoutRows"
      :pagination="false"
      size="middle"
      class="doc-table"
    />

    <a-typography-title id="doc-layout" data-anchor="doc-layout" :level="2">
      DocLayout
    </a-typography-title>
    <a-typography-paragraph>
      <code>DocLayout</code> 位于 <code>src/layouts/DocLayout.vue</code>，当前由组件文档站
      <code>ComponentsDocView</code> 使用。它提供固定 Header、可折叠左侧文档导航、内容滚动容器和
      右侧页内目录，适合长文档阅读，不承担通用后台应用 Shell 的职责。
    </a-typography-paragraph>

    <a-typography-title id="three-column-layout" data-anchor="three-column-layout" :level="2">
      ThreeColumnLayout
    </a-typography-title>
    <a-typography-paragraph>
      <code>ThreeColumnLayout</code> 位于 <code>src/layouts/ThreeColumnLayout.vue</code>。桌面端按
      左侧栏、主内容、右侧栏三列占位显示；移动端启用浮层侧栏和遮罩，由调用方结合断点、Esc 和路由切换
      管理状态。
    </a-typography-paragraph>

    <a-typography-title id="demo" data-anchor="demo" :level="2">示例</a-typography-title>
    <a-typography-paragraph>
      下方 Dashboard
      使用静态数据验证左右侧栏折叠、移动端浮层和主内容滚动。拖窄窗口后，左、右侧栏会以
      浮层形式打开，不再压缩内容区。
    </a-typography-paragraph>
    <ThreeColumnDashboardDemo />

    <a-typography-title id="api" data-anchor="api" :level="2">API</a-typography-title>
    <a-typography-title :level="3">Props</a-typography-title>
    <a-table
      :columns="propColumns"
      :data-source="propRows"
      :pagination="false"
      size="middle"
      class="doc-table"
    />

    <a-typography-title :level="3">Events</a-typography-title>
    <a-table
      :columns="propColumns.filter((column) => column.key !== 'default')"
      :data-source="eventRows"
      :pagination="false"
      size="middle"
      class="doc-table"
    />

    <a-typography-title :level="3">Slots</a-typography-title>
    <a-table
      :columns="propColumns.filter((column) => column.key !== 'default')"
      :data-source="slotRows"
      :pagination="false"
      size="middle"
      class="doc-table"
    />
  </main>
</template>

<style scoped>
.layout-doc-page {
  width: min(1040px, 100%);
  margin: 0 auto;
}

.doc-page-alert {
  margin: 16px 0 24px;
}

.doc-table {
  margin-bottom: 24px;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import CodeBlock from '@/components/CodeBlock.vue'

const x = ref(100)
const y = ref(100)
const h = ref(120)
const w = ref(110)
const active = ref(false)

const log: string[] = []
const print = (val: string) => {
  log.push(val)
  if (log.length > 20) log.shift()
}

const source = `<Vue3DraggableResizable
  :parent="true"
  :initW="110"
  :initH="120"
  v-model:x="x"
  v-model:y="y"
  v-model:w="w"
  v-model:h="h"
  v-model:active="active"
  :draggable="true"
  :resizable="true"
  @activated="print('activated')"
  @drag-start="print('drag-start')"
  @resize-start="print('resize-start')"
  @dragging="print('dragging')"
  @resizing="print('resizing')"
  @drag-end="print('drag-end')"
  @resize-end="print('resize-end')"
>
  <div>内容</div>
</Vue3DraggableResizable>`

const apiColumns = [
  { title: 'Prop / 事件', dataIndex: 'name', key: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
  { title: '说明', dataIndex: 'description', key: 'description' }
]

const apiRows = [
  { key: '1', name: 'parent', type: 'boolean', description: '是否限制在父容器内移动' },
  { key: '2', name: 'initW / initH', type: 'number', description: '初始宽高' },
  { key: '3', name: 'x / y / w / h', type: 'number (v-model)', description: '当前位置和尺寸' },
  { key: '4', name: 'draggable / resizable', type: 'boolean', description: '是否可拖拽 / 缩放' },
  { key: '5', name: 'handles', type: "Array<'tl'|'tr'|'bl'|'br'|...>", description: '允许的缩放手柄' },
  { key: '6', name: 'activated / deactivated', type: 'event', description: '激活/失活事件' },
  { key: '7', name: 'drag-start / drag-end', type: 'event', description: '拖拽开始/结束' },
  { key: '8', name: 'resize-start / resize-end', type: 'event', description: '缩放开始/结束' }
]
</script>

<template>
  <main class="doc-page">
    <header class="doc-page-hero">
      <a-typography-paragraph class="doc-page-eyebrow">组件文档 / 元素拖拽缩放</a-typography-paragraph>
      <a-typography-title id="overview" data-anchor="overview" :level="1" class="doc-page-title">元素拖拽缩放 DragResize</a-typography-title>
      <a-typography-paragraph class="doc-page-summary">
        基于 <code>vue3-draggable-resizable</code> 的单元素拖拽与缩放，常用于面板、便签、可视化编辑器。
      </a-typography-paragraph>
    </header>

    <a-alert
      type="info"
      show-icon
      class="doc-page-alert"
      message="何时使用 / 何时不用"
      description="单元素需要拖拽 + 缩放 + 边界限制时使用；列表排序请用 vue-draggable-plus。"
    />

    <a-typography-title id="basic" data-anchor="basic" :level="2">基础示例</a-typography-title>
    <a-tabs>
      <a-tab-pane key="preview" tab="预览">
        <a-card class="doc-card-preview">
          <div class="doc-stage">
            <Vue3DraggableResizable
              :parent="true"
              :init-w="110"
              :init-h="120"
              v-model:x="x"
              v-model:y="y"
              v-model:w="w"
              v-model:h="h"
              v-model:active="active"
              :draggable="true"
              :resizable="true"
              @activated="print('activated')"
              @deactivated="print('deactivated')"
              @drag-start="print('drag-start')"
              @resize-start="print('resize-start')"
              @dragging="print('dragging')"
              @resizing="print('resizing')"
              @drag-end="print('drag-end')"
              @resize-end="print('resize-end')"
            >
              <div class="doc-box">拖我 / 缩放我</div>
            </Vue3DraggableResizable>
          </div>
          <div class="doc-state">
            <p>坐标：x={{ x }}, y={{ y }}, w={{ w }}, h={{ h }}, active={{ active }}</p>
            <p>事件：{{ log.length ? log.join(', ') : '—' }}</p>
          </div>
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="code" tab="代码">
        <CodeBlock :code="source" language="xml" />
      </a-tab-pane>
    </a-tabs>

    <a-typography-title id="api" data-anchor="api" :level="2">API 摘要</a-typography-title>
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
        <li><RouterLink to="/components/draggable">列表拖拽</RouterLink></li>
        <li><RouterLink to="/components/modal">Modal</RouterLink>（内部使用本组件实现窗口拖拽）</li>
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
  display: grid;
  gap: 12px;
}

.doc-stage {
  position: relative;
  width: 100%;
  height: 400px;
  background: #f5f7fb;
  border: 1px dashed #dce2eb;
  border-radius: 8px;
}

.doc-box {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #ffffff;
  background: #42b983;
  border-radius: 6px;
  user-select: none;
}

.doc-state {
  padding: 10px 12px;
  color: #5d6678;
  background: #f5f7fb;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.6;
}

.doc-state p {
  margin: 0;
}

.doc-table {
  margin-bottom: 24px;
}
</style>

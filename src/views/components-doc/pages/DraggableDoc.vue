<script setup lang="ts">
import { ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import CodeBlock from '@/components/CodeBlock.vue'

interface Item {
  id: number
  name: string
}

const list = ref<Item[]>([
  { name: 'Joao', id: 1 },
  { name: 'Jean', id: 2 },
  { name: 'Johanna', id: 3 },
  { name: 'Juan', id: 4 }
])

const source = `<VueDraggable ref="el" v-model="list">
  <div v-for="item in list" :key="item.id">
    {{ item.name }}
  </div>
</VueDraggable>`

const apiColumns = [
  { title: 'Prop / 事件', dataIndex: 'name', key: 'name', width: 200 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 200 },
  { title: '说明', dataIndex: 'description', key: 'description' }
]

const apiRows = [
  { key: '1', name: 'v-model', type: 'Array<T>', description: '双向绑定的列表数据，拖拽后自动重排' },
  { key: '2', name: 'group', type: 'string | GroupOptions', description: '拖拽分组；同名 group 之间可互拖' },
  { key: '3', name: 'animation', type: 'number', description: '拖拽动画时长（ms）' },
  { key: '4', name: 'handle', type: 'string', description: 'CSS 选择器，指定可拖拽手柄' },
  { key: '5', name: 'onUpdate', type: '(modelValue) => void', description: '列表更新后回调' },
  { key: '6', name: 'onEnd', type: '(evt) => void', description: '拖拽结束时回调，evt 含 oldIndex / newIndex' }
]
</script>

<template>
  <main class="doc-page">
    <header class="doc-page-hero">
      <a-typography-paragraph class="doc-page-eyebrow">组件文档 / 列表拖拽</a-typography-paragraph>
      <a-typography-title id="overview" data-anchor="overview" :level="1" class="doc-page-title">列表拖拽 Draggable</a-typography-title>
      <a-typography-paragraph class="doc-page-summary">
        基于 <code>vue-draggable-plus</code> 的列表拖拽排序，支持分组、动画与拖拽手柄。
      </a-typography-paragraph>
    </header>

    <a-alert
      type="info"
      show-icon
      class="doc-page-alert"
      message="何时使用 / 何时不用"
      description="需要对一组同类元素进行排序（如看板、列表管理）时使用；跨容器拖拽或文件拖拽请用其它库。"
    />

    <a-typography-title id="basic" data-anchor="basic" :level="2">基础示例</a-typography-title>
    <a-tabs>
      <a-tab-pane key="preview" tab="预览">
        <a-card class="doc-card-preview">
          <VueDraggable ref="el" v-model="list" class="doc-list">
            <div v-for="item in list" :key="item.id" class="doc-list-item">
              <span class="doc-list-handle">⋮⋮</span>
              <span class="doc-list-name">{{ item.name }}</span>
              <span class="doc-list-id">#{{ item.id }}</span>
            </div>
          </VueDraggable>
          <CodeBlock :code="JSON.stringify(list, null, 2)" language="json" :show-copy="false" />
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="code" tab="代码">
        <CodeBlock :code="source" language="xml" />
      </a-tab-pane>
    </a-tabs>

    <a-typography-title id="api" data-anchor="api" :level="2">API 摘要</a-typography-title>
    <a-typography-paragraph>
      完整 API 请参考
      <a href="https://vue-draggable-plus.pages.dev" target="_blank">vue-draggable-plus 官方文档</a>。
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
        <li><RouterLink to="/components/drag-resize">元素拖拽缩放</RouterLink></li>
        <li><RouterLink to="/components/modal">Modal</RouterLink>（窗口内拖拽）</li>
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

.doc-list {
  display: grid;
  gap: 8px;
}

.doc-list-item {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  color: #172033;
  background: #f5f7fb;
  border: 1px solid #dce2eb;
  border-radius: 8px;
  cursor: grab;
}

.doc-list-handle {
  color: #5d6678;
  user-select: none;
}

.doc-list-name {
  font-weight: 600;
}

.doc-list-id {
  color: #5d6678;
  font-size: 12px;
}

.doc-table {
  margin-bottom: 24px;
}
</style>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { Modal } from '@/utils/modal-manager'
import AboutContent, { type AboutContentExpose } from '@/components/AboutContent.vue'
import ModalContextProbe from '@/components/Modal/ModalContextProbe.vue'
import {
  type ModalInstance,
  type ModalManagerInterface
} from '@/types/components/modal.d'
import { useCounterStore } from '@/stores/counter'

const counterStore = useCounterStore()
const modal = inject<ModalManagerInterface>('modal')

const showModal = ref(false)
const showFooter = ref(true)
const modelKey = ref(0)

const closeAll = () => Modal.closeAll()
const closeDeclarativeModal = () => {
  showModal.value = false
  modelKey.value++
}

const openModalByFunction = () => {
  Modal.open({
    key: 'modal-api-1',
    title: 'API 弹窗 - 完整示例',
    showMask: true,
    showHeader: true,
    clickMaskClose: true,
    component: AboutContent,
    componentProps: { userName: '张三' },
    footer: [
      { name: '发送', eventName: 'send', icon: '', type: 'default' },
      { name: '关闭', eventName: 'close', icon: '', type: 'default' },
      { name: '隐藏', eventName: 'hide', icon: '', type: 'default' },
      { name: '打印 count', eventName: 'print', icon: '', type: 'default' },
      { name: '增加 count', eventName: 'increment', icon: '', type: 'default' }
    ],
    on: {
      send: (ctl: ModalInstance) => {
        console.log('send', ctl)
      },
      close: (ctl: ModalInstance) => ctl.close(),
      hide: (ctl: ModalInstance) => ctl.hide(),
      print: (ctl: ModalInstance<AboutContentExpose>) => {
        console.log(ctl.contentComponent?.getCount(), ctl.contentComponent?.count)
      },
      increment: (ctl: ModalInstance<AboutContentExpose>) => ctl.contentComponent?.increment()
    }
  })
}

const openModalByInject = () => {
  modal?.open({
    key: 'modal-inject',
    title: '通过 inject 打开',
    component: AboutContent,
    componentProps: { userName: 'inject 打开' },
    showMask: true,
    showHeader: true
  })
}

const openModalByString = () => {
  Modal.open({
    key: 'modal-string',
    title: '字符串内容',
    component: '纯字符串内容，按文本渲染'
  })
}

const openModalByVNode = () => {
  Modal.open({
    key: 'modal-vnode',
    title: '函数式 VNode',
    component: () =>
      h(
        'div',
        { style: { background: 'green', color: 'white', padding: '12px' } },
        '通过 h() 函数渲染的 VNode 内容'
      )
  })
}

const openModalByOptions = () => {
  Modal.open({
    key: 'modal-options',
    title: '通过选项式 API 创建',
    component: AboutContent,
    componentProps: { userName: '选项式 API' },
    showMask: true,
    showHeader: true
  })
}

const openModalByTrustedHtml = () => {
  Modal.open({
    key: 'modal-trusted',
    title: Modal.trustedHtml('<span style="color: green">可信 HTML 标题</span>'),
    component: Modal.trustedHtml(
      '<div style="background: green; color: white; padding: 12px;">通过显式可信 HTML API 渲染</div>'
    )
  })
}

const openContextProbe = () => {
  Modal.open({
    key: 'modal-context',
    title: '主应用上下文验证',
    component: ModalContextProbe,
    footer: [{ name: '关闭', eventName: 'close', icon: '', type: 'default' }]
  })
}

const openDraggableModal = () => {
  Modal.open({
    key: 'modal-draggable',
    title: '可拖拽缩放的弹窗',
    component: () => h('div', { style: 'padding: 20px' }, '拖动头部 / 右下角缩放'),
    draggable: true,
    resizable: true,
    clickMaskClose: true
  })
}

const declarativeSource = `<YlModal
  :key="modelKey"
  :visible="showModal"
  :show-footer="showFooter"
  :show-mask="true"
  @close="closeDeclarativeModal"
>
  <template v-slot:header>标题</template>
  <template v-slot:body>
    <AboutView user-name="外部传入" @btn-click="closeDeclarativeModal" />
  </template>
</YlModal>`

const apiSource = `import { Modal } from '@/utils/modal-manager'

Modal.open({
  key: 'my-modal',
  title: '标题',
  component: AboutView,
  componentProps: { userName: '张三' },
  footer: [
    { name: '关闭', eventName: 'close', icon: '', type: 'default' }
  ],
  on: {
    close: (ctl: ModalInstance) => ctl.close()
  }
})`

const optionsSource = `import { defineComponent } from 'vue'

export default defineComponent({
  methods: {
    showModal() {
      this.$modal.open({
        key: 'options-modal',
        title: '选项式',
        component: AboutView,
        componentProps: { userName: '选项式' }
      })
    }
  }
})`

const trustedSource = `// 仅可信静态内容可走 innerHTML
Modal.open({
  key: 'trusted',
  title: Modal.trustedHtml('<b>可信</b>'),
  component: Modal.trustedHtml('<div>可信 HTML</div>')
})`

const apiColumns = [
  { title: '字段', dataIndex: 'name', key: 'name', width: 160 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 220 },
  { title: '必填', dataIndex: 'required', key: 'required', width: 80 },
  { title: '说明', dataIndex: 'description', key: 'description' }
]

const apiRows = [
  { key: 'key', name: 'key', type: 'string | number', required: '否', description: '唯一标识；同 key 重复 open() 不会重建，仅 show()' },
  { key: 'title', name: 'title', type: 'string | VNode | TrustedHtml', required: '否', description: '弹窗标题' },
  { key: 'component', name: 'component', type: 'string | Component | VNode | () => VNode | TrustedHtml', required: '否', description: '弹窗主体内容' },
  { key: 'componentProps', name: 'componentProps', type: 'object', required: '否', description: '传给 content 组件的 props' },
  { key: 'footer', name: 'footer', type: 'Component | VNode | ButtonAndEvent[]', required: '否', description: '底部按钮；数组时按 eventName/on 派发' },
  { key: 'on', name: 'on', type: 'Record<string, (ctl) => void>', required: '否', description: '事件回调 Map，键为 eventName' },
  { key: 'showMask', name: 'showMask', type: 'boolean', required: '否', description: '是否显示遮罩' },
  { key: 'clickMaskClose', name: 'clickMaskClose', type: 'boolean', required: '否', description: '点击遮罩是否关闭' },
  { key: 'isTeleport', name: 'isTeleport', type: 'boolean', required: '否', description: '是否 teleport 到 body' },
  { key: 'resizable', name: 'resizable', type: 'boolean', required: '否', description: '允许右下角缩放' },
  { key: 'draggable', name: 'draggable', type: 'boolean', required: '否', description: '允许拖拽' }
]
</script>

<template>
  <main class="doc-page">
    <header class="doc-page-hero">
      <a-typography-paragraph class="doc-page-eyebrow">组件文档 / 模态框</a-typography-paragraph>
      <a-typography-title id="overview" data-anchor="overview" :level="1" class="doc-page-title">模态框 Modal</a-typography-title>
      <a-typography-paragraph class="doc-page-summary">
        三层结构：<code>YlModal</code>（表现层）+ <code>YlModalHost</code>（统一渲染器）+ <code>ModalManager</code>（单例）。
        支持声明式、API 调用、选项式调用三种方式，默认文本渲染，可信 HTML 需走 <code>trustedHtml</code>。
      </a-typography-paragraph>
    </header>

    <a-alert
      type="info"
      show-icon
      class="doc-page-alert"
      message="何时使用 / 何时不用"
      description="内容复杂或需要异步加载时使用 API 调用；简单确认框可用 antd <a-modal>；用户输入内容禁止走 trustedHtml。"
    />

    <a-alert
      type="warning"
      show-icon
      class="doc-page-alert"
      message="安全提示"
      description="字符串 title / component 默认按文本渲染。trustedHtml() 不做清洗，禁止传入未清洗的用户输入。"
    />

    <a-typography-title id="declarative" data-anchor="declarative" :level="2">声明式</a-typography-title>
    <a-tabs>
      <a-tab-pane key="preview" tab="预览">
        <a-card class="doc-card-actions">
          <a-button type="primary" @click="showModal = true">弹出 Modal</a-button>
          <a-button @click="closeDeclarativeModal">关闭并重建</a-button>
          <p class="doc-hint">共享 Pinia count: {{ counterStore.count }}</p>
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="code" tab="代码">
        <pre class="doc-pre"><code>{{ declarativeSource }}</code></pre>
      </a-tab-pane>
    </a-tabs>

    <YlModal
      :key="modelKey"
      :visible="showModal"
      :show-footer="showFooter"
      :show-mask="true"
      @ok="showFooter = !showFooter"
      @close="closeDeclarativeModal"
    >
      <template v-slot:header>
        弹出框标题（标题很长很长很长很长很长很长）
      </template>
      <template v-slot:body>
        <AboutContent userName="外部传入用户" @btnClick="closeDeclarativeModal" />
      </template>
    </YlModal>

    <a-typography-title id="api" data-anchor="api" :level="2">API 调用</a-typography-title>
    <a-tabs>
      <a-tab-pane key="preview" tab="预览">
        <a-card class="doc-card-actions">
          <a-button type="primary" @click="openModalByFunction">完整示例（含 footer + on）</a-button>
          <a-button @click="openModalByInject">通过 inject 调用</a-button>
          <a-button @click="openModalByString">字符串内容</a-button>
          <a-button @click="openModalByVNode">函数式 VNode</a-button>
          <a-button type="danger" @click="closeAll">关闭所有</a-button>
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="code" tab="代码">
        <pre class="doc-pre"><code>{{ apiSource }}</code></pre>
      </a-tab-pane>
    </a-tabs>

    <a-typography-title id="options" data-anchor="options" :level="2">选项式 API</a-typography-title>
    <a-tabs>
      <a-tab-pane key="preview" tab="预览">
        <a-card class="doc-card-actions">
          <a-button type="primary" @click="openModalByOptions">选项式弹出 Modal</a-button>
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="code" tab="代码">
        <pre class="doc-pre"><code>{{ optionsSource }}</code></pre>
      </a-tab-pane>
    </a-tabs>

    <a-typography-title id="context" data-anchor="context" :level="2">主应用上下文</a-typography-title>
    <a-typography-paragraph>
      动态 Modal 在主应用组件树中渲染（Host 位于 <code>App.vue</code>，不被嵌套路由卸载），
      因此内容组件可以直接访问 Router、Pinia、应用级 provide 和 <code>$modal</code>。
    </a-typography-paragraph>
    <a-card class="doc-card-actions">
      <a-button type="primary" @click="openContextProbe">验证主应用上下文</a-button>
    </a-card>

    <a-typography-title id="trusted" data-anchor="trusted" :level="2">可信 HTML</a-typography-title>
    <a-alert type="warning" show-icon class="doc-page-alert" message="危险操作" description="trustedHtml() 不做清洗，禁止传入未清洗的用户输入。" />
    <a-tabs>
      <a-tab-pane key="preview" tab="预览">
        <a-card class="doc-card-actions">
          <a-button type="primary" @click="openModalByTrustedHtml">弹出可信 HTML 弹窗</a-button>
        </a-card>
      </a-tab-pane>
      <a-tab-pane key="code" tab="代码">
        <pre class="doc-pre"><code>{{ trustedSource }}</code></pre>
      </a-tab-pane>
    </a-tabs>

    <a-typography-title id="draggable" data-anchor="draggable" :level="2">拖拽缩放</a-typography-title>
    <a-typography-paragraph>
      通过 <code>draggable</code> / <code>resizable</code> 选项开启；resize handle 仅在右下角。
    </a-typography-paragraph>
    <a-card class="doc-card-actions">
      <a-button type="primary" @click="openDraggableModal">弹出可拖拽缩放弹窗</a-button>
    </a-card>

    <a-typography-title id="options-api" data-anchor="options-api" :level="2">ModalOptions</a-typography-title>
    <a-typography-paragraph>
      完整字段定义见 <code>src/types/components/modal.d.ts</code>。注意 <code>body</code> 与 <code>onClose</code> 不是合法字段，
      关闭请用 footer <code>eventName: 'close'</code> 或 <code>ModalInstance.close()</code>。
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
        <li><code>src/components/Modal/YlModal.vue</code> — 表现层</li>
        <li><code>src/components/Modal/YlModalHost.vue</code> — 渲染器</li>
        <li><code>src/utils/modal-manager.ts</code> — 管理器</li>
        <li><a href="/docs/modal-mounting-optimization.md" target="_blank">动态 Modal 挂载机制优化</a></li>
        <li><a href="/docs/dynamic-modal-context-inheritance.md" target="_blank">动态 Modal 主应用上下文继承</a></li>
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

.doc-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.doc-hint {
  flex-basis: 100%;
  margin: 0;
  color: #5d6678;
  font-size: 12px;
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

.doc-table {
  margin-bottom: 24px;
}
</style>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import type { EChartsType } from 'echarts/core'
import echarts, { type ECOption } from '@/core/echarts-import'
import CodeBlock from '@/components/CodeBlock.vue'

const echartsDom = ref<HTMLDivElement | null>(null)
const echartsInstance = shallowRef<EChartsType | null>(null)
let resizeObserver: ResizeObserver | null = null

const option: ECOption = {
  title: {
    text: 'ECharts 入门示例'
  },
  tooltip: {},
  xAxis: {
    data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
  },
  yAxis: {},
  series: [
    {
      name: '销量',
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20]
    }
  ]
}

onMounted(() => {
  const container = echartsDom.value
  if (!container) return

  const instance = echarts.init(container)
  echartsInstance.value = instance
  instance.setOption(option)

  resizeObserver = new ResizeObserver(() => {
    echartsInstance.value?.resize()
  })
  resizeObserver.observe(container)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  echartsInstance.value?.dispose()
  echartsInstance.value = null
})

const source = `import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer
])

export default echarts`

const lifecycleSource = `const echartsDom = ref<HTMLDivElement | null>(null)
const echartsInstance = shallowRef<EChartsType | null>(null)
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  const container = echartsDom.value
  if (!container) return
  const instance = echarts.init(container)
  echartsInstance.value = instance
  instance.setOption(option)
  resizeObserver = new ResizeObserver(() => {
    echartsInstance.value?.resize()
  })
  resizeObserver.observe(container)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  echartsInstance.value?.dispose()
  echartsInstance.value = null
})`

const apiColumns = [
  { title: '函数', dataIndex: 'name', key: 'name', width: 220 },
  { title: '模块', dataIndex: 'module', key: 'module', width: 200 },
  { title: '说明', dataIndex: 'description', key: 'description' }
]

const apiRows = [
  { key: '1', name: 'BarChart', module: 'echarts/charts', description: '柱状图系列' },
  { key: '2', name: 'LineChart', module: 'echarts/charts', description: '折线图系列' },
  { key: '3', name: 'PieChart', module: 'echarts/charts', description: '饼图系列' },
  { key: '4', name: 'TitleComponent', module: 'echarts/components', description: '标题组件' },
  { key: '5', name: 'TooltipComponent', module: 'echarts/components', description: '提示框组件' },
  { key: '6', name: 'GridComponent', module: 'echarts/components', description: '网格组件' },
  { key: '7', name: 'DatasetComponent', module: 'echarts/components', description: '数据集组件' },
  { key: '8', name: 'CanvasRenderer', module: 'echarts/renderers', description: 'Canvas 渲染器（默认）' }
]
</script>

<template>
  <main class="doc-page">
    <header class="doc-page-hero">
      <a-typography-paragraph class="doc-page-eyebrow">组件文档 / 图表</a-typography-paragraph>
      <a-typography-title id="overview" data-anchor="overview" :level="1" class="doc-page-title">图表 ECharts</a-typography-title>
      <a-typography-paragraph class="doc-page-summary">
        按需引入 ECharts，统一在 <code>core/echarts-import.ts</code> 注册；
        实例初始化、容器 resize、卸载 dispose 全部按生命周期管理。
      </a-typography-paragraph>
    </header>

    <a-alert
      type="info"
      show-icon
      class="doc-page-alert"
      message="何时使用 / 何时不用"
      description="项目内所有图表都走 @/core/echarts-import 统一注册；禁止页面直接 import 完整 echarts 包，否则包体会显著膨胀。"
    />

    <a-typography-title id="basic" data-anchor="basic" :level="2">基础示例</a-typography-title>
    <a-card class="doc-chart-card">
      <div ref="echartsDom" class="echartsContainer"></div>
    </a-card>

    <a-typography-title id="on-demand" data-anchor="on-demand" :level="2">按需注册</a-typography-title>
    <a-typography-paragraph>
      所有按需模块集中在 <code>src/core/echarts-import.ts</code> 注册，不要在页面中改为导入完整 <code>echarts</code> 包。
    </a-typography-paragraph>
    <CodeBlock :code="source" language="javascript" />

    <a-typography-title id="lifecycle" data-anchor="lifecycle" :level="2">生命周期</a-typography-title>
    <a-typography-paragraph>
      DOM mounted 后初始化，<code>ResizeObserver</code> 监听容器尺寸，unmounted 前 <code>dispose()</code>。
    </a-typography-paragraph>
    <CodeBlock :code="lifecycleSource" language="typescript" />

    <a-typography-title id="api" data-anchor="api" :level="2">已注册模块</a-typography-title>
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
        <li><code>src/core/echarts-import.ts</code> — 注册入口</li>
        <li><a href="/docs/echarts-lifecycle-management.md" target="_blank">ECharts 生命周期管理修复计划</a></li>
        <li><a href="/docs/echarts-bundle-size-optimization.md" target="_blank">ECharts 打包体积优化计划</a></li>
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

.doc-chart-card {
  margin-bottom: 24px;
}

.echartsContainer {
  width: 100%;
  height: 360px;
  min-width: 100px;
  min-height: 360px;
}

.doc-table {
  margin-bottom: 24px;
}
</style>

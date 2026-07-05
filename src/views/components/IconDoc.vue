<script setup lang="ts">
import IconUsageGuide from '@/components/IconUsageGuide.vue'
</script>

<template>
  <main class="doc-page icon-doc-page">
    <header class="doc-page-hero">
      <a-typography-paragraph class="doc-page-eyebrow">组件文档 / 图标</a-typography-paragraph>
      <a-typography-title id="overview" data-anchor="overview" :level="1" class="doc-page-title">图标 Icon</a-typography-title>
      <a-typography-paragraph class="doc-page-summary">
        本项目支持在线 Iconify、构建期离线组件和本地自定义图标。选择方式时主要考虑
        运行环境是否联网、图标名称是否需要动态切换，以及是否需要使用项目自己的 SVG。
      </a-typography-paragraph>
    </header>

    <a-alert
      type="info"
      show-icon
      class="doc-page-alert"
      message="何时使用 / 何时不用"
      description="需要按字符串/变量动态切换图标名时优先使用 <Icon :icon='name' />；图标固定、希望构建产物自包含时使用 <i-mdi-home />；品牌或业务图标放入 src/assets/images/svg/single|muliti/ 后由 svg-json-generate 生成。"
    />

    <a-typography-title id="usage" data-anchor="usage" :level="2">
      使用指南
    </a-typography-title>
    <a-typography-paragraph>
      以下是项目内完整的图标使用指南，包含在线、离线按需、自定义单色与多色图标的所有用法示例与代码。
    </a-typography-paragraph>

    <section class="icon-doc-embed">
      <IconUsageGuide />
    </section>

    <a-typography-title id="links" data-anchor="links" :level="2">
      相关链接
    </a-typography-title>
    <a-typography-paragraph>
      <ul>
        <li>
          <RouterLink to="/components/modal">Modal 文档</RouterLink>（弹窗内动态图标）
        </li>
        <li>
          <RouterLink to="/components/echarts">ECharts 文档</RouterLink>（图表内动态图标）
        </li>
        <li>
          <a href="/docs/icon-usage-guide-component.md" target="_blank">图标使用指南组件计划</a>
        </li>
        <li>
          <a href="/docs/reproducible-svg-iconify-generation.md" target="_blank">SVG → Iconify JSON 可复现流程</a>
        </li>
      </ul>
    </a-typography-paragraph>
  </main>
</template>

<style scoped>
.icon-doc-page {
  width: min(1120px, calc(100% - 0px));
  margin: 0 auto;
}

.doc-page-alert {
  margin: 16px 0 24px;
}

.icon-doc-embed {
  /* 让嵌入的 IconUsageGuide 自身样式生效 */
  margin: 0 -32px;
}

@media (max-width: 640px) {
  .icon-doc-embed {
    margin: 0 -16px;
  }
}
</style>

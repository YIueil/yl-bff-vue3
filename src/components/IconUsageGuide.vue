<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import CodeBlock from '@/components/CodeBlock.vue'

const dynamicIcons = [
  { label: '在线图标', value: 'mdi:palette-outline' },
  { label: '自定义单色', value: 'custom:box' },
  { label: '自定义多色', value: 'custom:apple' }
]
const selectedIcon = ref(dynamicIcons[0].value)

const onlineCode = `import { Icon } from '@iconify/vue'

<Icon icon="mdi:home" width="32" height="32" />`

const offlineCode = `<!-- 组件名格式：i-图标集-图标名 -->
<i-mdi-home width="32" height="32" color="#dc2626" />`

const customCode = `import { Icon } from '@iconify/vue'

<!-- 单色图标：生成时已转换为 currentColor -->
<Icon icon="custom:box" width="32" color="#2563eb" />

<!-- 多色图标：保留 SVG 中的原始颜色 -->
<Icon icon="custom:apple" width="32" />`

const dynamicCode = `const iconName = ref('mdi:palette-outline')

<Icon :icon="iconName" width="40" height="40" />`

const generateCode = `# 单色 SVG
src/assets/images/svg/single/

# 多色 SVG
src/assets/images/svg/multi/

# 重新生成两份 Iconify JSON
pnpm run icons:generate`
</script>

<template>
  <main class="icon-guide">
    <header class="hero">
      <p class="eyebrow">Iconify 集成指南</p>
      <h1>项目中的图标使用方式</h1>
      <p class="hero-description">
        本项目支持在线 Iconify、构建期离线组件和本地自定义图标。选择方式时主要考虑运行环境是否联网、
        图标名称是否需要动态切换，以及是否需要使用项目自己的 SVG。
      </p>
    </header>

    <section class="guide-section" aria-labelledby="comparison-title">
      <div class="section-heading">
        <span class="step">01</span>
        <div>
          <h2 id="comparison-title">先选择合适的方式</h2>
          <p>三种方式可以同时使用，但加载时机和适用场景不同。</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>方式</th>
              <th>运行时网络</th>
              <th>基本写法</th>
              <th>动态图标名</th>
              <th>适用场景</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>在线 Iconify</th>
              <td><span class="status status-warning">可能需要</span></td>
              <td><code>&lt;Icon icon="mdi:home" /&gt;</code></td>
              <td>支持</td>
              <td>快速使用 Iconify 图标集，部署环境允许访问网络</td>
            </tr>
            <tr>
              <th>离线按需组件</th>
              <td><span class="status status-success">不需要</span></td>
              <td><code>&lt;i-mdi-home /&gt;</code></td>
              <td>不适合</td>
              <td>图标固定、希望构建产物自包含的页面</td>
            </tr>
            <tr>
              <th>本地自定义</th>
              <td><span class="status status-success">不需要</span></td>
              <td><code>&lt;Icon icon="custom:box" /&gt;</code></td>
              <td>支持</td>
              <td>品牌图标、业务图标和项目自有 SVG</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="guide-section" aria-labelledby="online-title">
      <div class="section-heading">
        <span class="step">02</span>
        <div>
          <h2 id="online-title">在线 Iconify 图标</h2>
          <p>通过 <code>@iconify/vue</code> 的 <code>Icon</code> 组件，按“图标集:图标名”引用。</p>
        </div>
      </div>

      <div class="example-grid">
        <div class="preview-card">
          <div class="preview-icons online-icons" aria-label="在线 Iconify 示例">
            <Icon icon="mdi:home" width="36" height="36" />
            <Icon icon="mdi:cloud-outline" width="36" height="36" />
            <Icon icon="mdi:vuejs" width="36" height="36" />
          </div>
          <p>
            如果图标数据未被本地打包，Iconify 可能在浏览器中请求远程
            API。离线部署和严格网络策略环境不应依赖这种方式。
          </p>
        </div>
        <CodeBlock :code="onlineCode" language="xml" />
      </div>

      <aside class="notice">
        <strong>名称规则：</strong>
        <code>mdi:home</code> 中 <code>mdi</code> 是图标集，<code>home</code> 是图标名。可在 Iconify
        图标集合中查询可用名称。
      </aside>
    </section>

    <section class="guide-section" aria-labelledby="offline-title">
      <div class="section-heading">
        <span class="step">03</span>
        <div>
          <h2 id="offline-title">离线按需图标组件</h2>
          <p>
            <code>unplugin-icons</code> 在构建期解析组件名，<code>IconsResolver</code>
            负责让本地模板自动发现这些组件。
          </p>
        </div>
      </div>

      <div class="example-grid">
        <div class="preview-card">
          <div class="preview-icons offline-icons" aria-label="离线按需图标示例">
            <i-mdi-home width="36" height="36" />
            <i-mdi-download width="36" height="36" />
            <i-mdi-check-circle-outline width="36" height="36" />
          </div>
          <p>
            图标会进入构建产物，运行时无需请求 Iconify
            API。组件名需要在源码中静态可见，不能用字符串在运行时拼出
            <code>i-mdi-*</code> 组件。
          </p>
        </div>
        <CodeBlock :code="offlineCode" language="xml" />
      </div>
    </section>

    <section class="guide-section" aria-labelledby="custom-title">
      <div class="section-heading">
        <span class="step">04</span>
        <div>
          <h2 id="custom-title">本地自定义图标</h2>
          <p>
            应用启动时由 <code>src/core/svg-import.ts</code> 注册 prefix 为
            <code>custom</code> 的两份本地图标集合。
          </p>
        </div>
      </div>

      <div class="custom-grid">
        <article class="icon-kind-card">
          <div class="kind-heading">
            <div class="kind-icon monochrome-sample">
              <Icon icon="custom:box" width="42" height="42" />
            </div>
            <div>
              <h3>单色图标</h3>
              <code>custom:box</code>
            </div>
          </div>
          <p>
            单色目录中的 SVG 在生成时会转换为 <code>currentColor</code>。可以使用
            <code>color</code> 属性，也可以继承父元素的文本颜色。
          </p>
          <div class="color-examples" aria-label="自定义单色图标改色示例">
            <span class="color-example color-blue">
              <Icon icon="custom:box" width="28" height="28" />
              蓝色
            </span>
            <span class="color-example color-orange">
              <Icon icon="custom:box" width="28" height="28" />
              橙色
            </span>
          </div>
        </article>

        <article class="icon-kind-card">
          <div class="kind-heading">
            <div class="kind-icon multicolor-sample">
              <Icon icon="custom:apple" width="42" height="42" />
            </div>
            <div>
              <h3>多色图标</h3>
              <code>custom:apple</code>
            </div>
          </div>
          <p>
            多色目录中的 SVG 保留自身的填充色。设置外层 <code>color</code>
            通常不会整体替换图标内部的固定色值。
          </p>
          <div class="preview-icons custom-multicolor" aria-label="自定义多色图标示例">
            <Icon icon="custom:apple" width="34" height="34" />
            <Icon icon="custom:spring" width="38" height="38" />
            <Icon icon="custom:logo" width="42" height="38" />
          </div>
        </article>
      </div>

      <CodeBlock :code="customCode" language="xml" class="code-gap" />
    </section>

    <section class="guide-section" aria-labelledby="common-title">
      <div class="section-heading">
        <span class="step">05</span>
        <div>
          <h2 id="common-title">尺寸、颜色与动态名称</h2>
          <p><code>Icon</code> 支持属性控制，也可以继承 CSS 文本颜色。</p>
        </div>
      </div>

      <div class="control-grid">
        <article class="control-card">
          <h3>尺寸</h3>
          <div class="size-examples" aria-label="图标尺寸示例">
            <Icon icon="custom:box" width="20" height="20" />
            <Icon icon="custom:box" width="32" height="32" />
            <Icon icon="custom:box" width="48" height="48" />
          </div>
          <p>
            同时设置 <code>width</code> 和 <code>height</code> 最直观，也可以只设置一边保持比例。
          </p>
        </article>

        <article class="control-card inherited-color">
          <h3>继承颜色</h3>
          <Icon icon="custom:box" width="42" height="42" />
          <p>单色图标使用 <code>currentColor</code>，会继承当前元素或父元素的 CSS 颜色。</p>
        </article>

        <article class="control-card dynamic-card">
          <h3>动态名称</h3>
          <Icon :icon="selectedIcon" width="48" height="48" />
          <div class="icon-switcher" aria-label="动态图标选择">
            <button
              v-for="item in dynamicIcons"
              :key="item.value"
              type="button"
              :aria-pressed="selectedIcon === item.value"
              @click="selectedIcon = item.value"
            >
              {{ item.label }}
            </button>
          </div>
        </article>
      </div>

      <CodeBlock :code="dynamicCode" language="xml" class="code-gap" />
      <aside class="notice">
        动态值适用于 <code>&lt;Icon :icon="iconName" /&gt;</code>。离线的
        <code>&lt;i-mdi-home /&gt;</code> 是构建期组件，不应使用运行时字符串拼接组件名。
      </aside>
    </section>

    <section class="guide-section" aria-labelledby="generate-title">
      <div class="section-heading">
        <span class="step">06</span>
        <div>
          <h2 id="generate-title">添加自己的 SVG</h2>
          <p>选择正确目录，运行固定命令，然后检查生成结果和本页面。</p>
        </div>
      </div>

      <div class="workflow-grid">
        <ol class="workflow">
          <li>
            <strong>放置源文件</strong>
            <span
              >单色 SVG 放入 <code>single/</code>，需要保留原色的 SVG 放入
              <code>multi/</code>。</span
            >
          </li>
          <li>
            <strong>生成 Iconify JSON</strong>
            <span>执行 <code>pnpm run icons:generate</code>，命令可从任意工作目录调用。</span>
          </li>
          <li>
            <strong>核对输出</strong>
            <span>
              检查 <code>singleJsonFile.json</code> 和
              <code>multiJsonFile.json</code>，不要直接手工维护生成内容。
            </span>
          </li>
          <li>
            <strong>使用并验证</strong>
            <span>以 <code>custom:文件名</code> 引用图标，并在本页检查尺寸和颜色表现。</span>
          </li>
        </ol>
        <CodeBlock :code="generateCode" language="bash" />
      </div>

      <div class="file-flow" aria-label="自定义图标生成流程">
        <code>SVG 源文件</code>
        <span aria-hidden="true">→</span>
        <code>icons:generate</code>
        <span aria-hidden="true">→</span>
        <code>assets/json/*.json</code>
        <span aria-hidden="true">→</span>
        <code>svg-import.ts</code>
        <span aria-hidden="true">→</span>
        <code>&lt;Icon icon="custom:*" /&gt;</code>
      </div>
    </section>
  </main>
</template>

<style scoped>
.icon-guide {
  --ink: #172033;
  --muted: #5d6678;
  --line: #dce2eb;
  --surface: #ffffff;
  --surface-soft: #f5f7fb;
  --accent: #3157d5;
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
  padding: 48px 0 80px;
  color: var(--ink);
}

.hero {
  padding: 42px;
  overflow: hidden;
  background:
    radial-gradient(circle at 92% 10%, rgb(255 255 255 / 28%), transparent 28%),
    linear-gradient(135deg, #243b80, #3157d5 55%, #4a75ef);
  border-radius: 24px;
  color: #ffffff;
  box-shadow: 0 18px 50px rgb(26 51 117 / 22%);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.78;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 14px;
  font-size: clamp(32px, 5vw, 52px);
  line-height: 1.12;
}

.hero-description {
  max-width: 760px;
  margin-bottom: 0;
  color: rgb(255 255 255 / 86%);
  font-size: 17px;
  line-height: 1.8;
}

.guide-section {
  margin-top: 28px;
  padding: 32px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 10px 35px rgb(23 32 51 / 6%);
}

.section-heading {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.section-heading h2 {
  margin-bottom: 6px;
  font-size: 24px;
}

.section-heading p,
.preview-card p,
.icon-kind-card p,
.control-card p {
  margin-bottom: 0;
  color: var(--muted);
  line-height: 1.7;
}

.step {
  flex: 0 0 auto;
  padding: 7px 9px;
  color: var(--accent);
  background: #edf1ff;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 820px;
  border-collapse: collapse;
}

th,
td {
  padding: 15px 14px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}

thead th {
  color: var(--muted);
  background: var(--surface-soft);
  font-size: 13px;
}

tbody th {
  white-space: nowrap;
}

tbody tr:last-child th,
tbody tr:last-child td {
  border-bottom: 0;
}

code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.9em;
}

:not(pre) > code {
  padding: 2px 5px;
  color: #2948ad;
  background: #eef2ff;
  border-radius: 5px;
}

.status {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.status-warning {
  color: #8a4b08;
  background: #fff2d8;
}

.status-success {
  color: #11613d;
  background: #ddf7e9;
}

.example-grid,
.workflow-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 20px;
}

.preview-card,
.control-card,
.icon-kind-card {
  padding: 22px;
  background: var(--surface-soft);
  border: 1px solid #e5e9f0;
  border-radius: 14px;
}

.preview-icons {
  display: flex;
  gap: 20px;
  align-items: center;
  min-height: 62px;
  margin-bottom: 16px;
}

.online-icons {
  color: #3157d5;
}

.offline-icons {
  color: #dc2626;
}

.notice {
  margin-top: 18px;
  padding: 14px 16px;
  color: #414b5f;
  background: #f8faff;
  border-left: 4px solid #6685e6;
  border-radius: 8px;
  line-height: 1.7;
}

.code-gap {
  margin-top: 20px;
}

.custom-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.kind-heading {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;
}

.kind-heading h3 {
  margin-bottom: 4px;
}

.kind-icon {
  display: grid;
  width: 64px;
  height: 64px;
  flex: 0 0 64px;
  place-items: center;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 14px;
}

.monochrome-sample {
  color: #3157d5;
}

.color-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

.color-example {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
}

.color-blue {
  color: #2563eb;
}

.color-orange {
  color: #ea580c;
}

.custom-multicolor {
  margin-top: 12px;
  margin-bottom: 0;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.control-card h3 {
  margin-bottom: 18px;
}

.size-examples {
  display: flex;
  gap: 15px;
  align-items: flex-end;
  min-height: 54px;
  margin-bottom: 14px;
  color: #3157d5;
}

.inherited-color {
  color: #7c3aed;
}

.inherited-color p {
  margin-top: 12px;
}

.dynamic-card > svg {
  display: block;
  margin-bottom: 14px;
  color: #3157d5;
}

.icon-switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.icon-switcher button {
  padding: 7px 10px;
  color: #3f4859;
  background: #ffffff;
  border: 1px solid #cfd6e3;
  border-radius: 8px;
  cursor: pointer;
}

.icon-switcher button[aria-pressed='true'] {
  color: #ffffff;
  background: var(--accent);
  border-color: var(--accent);
}

.workflow {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: workflow;
}

.workflow li {
  position: relative;
  padding-left: 42px;
  counter-increment: workflow;
}

.workflow li::before {
  position: absolute;
  top: -2px;
  left: 0;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  color: #ffffff;
  background: var(--accent);
  border-radius: 50%;
  content: counter(workflow);
  font-size: 12px;
  font-weight: 800;
}

.workflow strong,
.workflow span {
  display: block;
}

.workflow span {
  margin-top: 4px;
  color: var(--muted);
  line-height: 1.6;
}

.file-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  padding: 18px;
  color: var(--muted);
  background: var(--surface-soft);
  border-radius: 12px;
}

@media (max-width: 800px) {
  .icon-guide {
    width: min(100% - 20px, 1120px);
    padding-top: 20px;
  }

  .hero,
  .guide-section {
    padding: 24px;
    border-radius: 16px;
  }

  .example-grid,
  .workflow-grid,
  .custom-grid,
  .control-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero,
  .guide-section {
    padding: 20px 16px;
  }

  .section-heading {
    gap: 10px;
  }

  .section-heading h2 {
    font-size: 21px;
  }
}
</style>

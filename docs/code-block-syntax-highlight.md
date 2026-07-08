# 文档示例代码语法高亮

## 目标与范围

为组件文档站的示例代码块增加语法高亮，提升可读性，并统一当前散落在各页面、重复定义的 `.doc-pre` 暗色代码块样式。

范围：

- 新增一个共享的 `<CodeBlock>` 组件，封装 highlight.js 高亮、暗色容器样式与右上角"复制"按钮。
- 用 `<CodeBlock>` 替换以下位置的源码展示：
  - `src/views/components-doc/pages/ModalDoc.vue`：`declarativeSource`(:237)、`apiSource`(:269)、`optionsSource`(:281)、`trustedSource`(:303)
  - `src/views/components-doc/pages/ButtonDoc.vue`：`typeSource`(:70)、`sizeSource`(:84)、`stateSource`(:98)
  - `src/views/components-doc/pages/EchartsDoc.vue`：`source`(:137)、`lifecycleSource`(:143)
  - `src/views/components-doc/pages/DraggableDoc.vue`：`source`(:72)，以及 `doc-state` 的 JSON 展示(:68)
  - `src/views/components-doc/pages/DragResizeDoc.vue`：`source`(:109)
  - `src/components/IconUsageGuide.vue`：`onlineCode`(:120)、`offlineCode`(:155)、`customCode`(:220)、`dynamicCode`(:268)、`generateCode`(:309)
- 删除各页面重复的 `.doc-pre` scoped 样式，由 `CodeBlock` 统一提供。

不在范围：

- Modal 弹窗内容（`Modal.trustedHtml` 渲染的示例）不在本次处理。
- 不引入 Markdown 解析管线；示例代码仍以内联字符串常量维护。
- `LayoutDoc`、`AboutDoc`、`IconDoc` 当前无 `doc-pre` 代码块，仅做格式核对，不强制改动。

## 现状问题

- 所有示例代码以组件内字符串常量保存，用原生 `<pre class="doc-pre"><code>{{ xxxSource }}</code></pre>` 渲染，仅做暗色背景 + 等宽字体的视觉包装，字符统一为 `#dbe6ff`，无关键字/字符串/注释分层着色。
- 暗色样式在 8+ 个文件中重复定义（如 `ModalDoc.vue:365-375`、`ButtonDoc.vue:146-156`），维护成本高、易漂移。
- 全仓库（含 `package.json`）未引入任何语法高亮 / Markdown 相关依赖。

## 推荐方案

### 1. 依赖

- 新增运行时依赖 `highlight.js`（用户已确认选型）。
- 采用按需引入以控制体积：使用 `highlight.js/lib/core` 并仅注册用到的语言包，避免全量打包。
- 注册语言：`typescript`、`javascript`、`xml`（用于 Vue 模板片段与 HTML）、`json`、`bash`。
- 复制按钮复用已依赖的 `@vueuse/core` 的 `useClipboard`，不引入新依赖。
- 主题：在 `CodeBlock` 内 `import 'highlight.js/styles/github-dark.css'`（体积小），并将容器背景重写为现有文档暗色 `#172033` 以与站点协调；如该主题与现有配色冲突，退化为在组件内自定义少量 `.hljs-*` token 颜色。

### 2. 共享组件 `src/components/CodeBlock.vue`

Props（补全类型，避免 `any`）：

- `code: string`（必填）—— 待高亮的源码字符串。
- `language?: string`（默认 `'xml'`）—— 语言标识；Vue 片段传 `'xml'`，纯 TS 传 `'typescript'`，JSON 传 `'json'`。
- `showCopy?: boolean`（默认 `true`）—— 是否显示复制按钮。
- `title?: string` —— 可选标题/文件名，显示在顶部栏。

实现要点：

- 用 `computed` 调用 `hljs.highlight(code, { language })`，输出经 highlight.js 转义的安全 HTML，通过 `v-html` 渲染到 `<code class="hljs">`。
- 语言未注册时降级为纯文本（`hljs.getLanguage(language)` 判断，缺失则 fallback 到 `plaintext`），避免运行时抛错。
- 复制按钮调用 `useClipboard().copy(code)`，点击后短暂显示"已复制"反馈。
- 顶部栏显示 `language` 标签与复制按钮；下方为带横向滚动的代码区，沿用现有 `padding:16px`、圆角 `8px`、`font-size:13px`、`line-height:1.6` 与等宽字体栈。

### 3. 替换与语言标注

按上表逐页把 `<pre class="doc-pre"><code>{{ xxxSource }}</code></pre>` 替换为 `<CodeBlock :code="xxxSource" language="..." />`：

- 模板片段（`ButtonDoc` 三段、`ModalDoc` 四段、`EchartsDoc`/`DraggableDoc`/`DragResizeDoc` 的 source、`IconUsageGuide` 五段）→ `language="xml"`。
- `EchartsDoc` 的 `lifecycleSource` 若以 TS 为主 → `language="typescript"`（实现时按实际内容定）。
- `DraggableDoc` 的 `doc-state` JSON 展示 → `<CodeBlock :code="JSON.stringify(list, null, 2)" language="json" :show-copy="false" />`。

页面通过显式 `import CodeBlock from '@/components/CodeBlock.vue'` 引入（不依赖自动注册的命名推断，保持一致性），并删除自身的 `.doc-pre` scoped 样式块。

## 接口兼容性

- `CodeBlock` 为新增公共组件，新增 props 与类型定义；不影响现有 `doc-pre` 之外的 API。
- 现有各页 `xxxSource` 字符串常量内容保持不变，仅渲染方式由原生 `<pre>` 改为 `CodeBlock`。
- 暗色视觉（背景 `#172033`、边框 `#26324a`、圆角 `8px`）在 `CodeBlock` 中保留，页面外观不退化。

## 风险

- **highlight.js 无原生 Vue 语言**：官方包不含 `vue` 语法。本方案用 `xml`（即 html）近似高亮 `.vue` 模板片段，能正确着色标签、属性与字符串，但 `<script>` 内的 TS 不会被着色。若需完整 SFC 着色，后续可引入社区语言包 `highlightjs-vue`（列为可选后续项，本次不默认引入以免增加依赖与体积）。
- **体积**：`highlight.js` core + 5 个语言包增量约数十 KB，不会显著加剧当前 ECharts 触发的 500 kB chunk 警告；仅在报告中说明既有警告依旧存在。
- **主题冲突**：`github-dark.css` 自带背景色，需在 `CodeBlock` 内用更高优先级规则覆盖为 `#172033`，否则会出现双层背景。
- **动态内容**：`DraggableDoc` 的 `doc-state` 依赖运行时 `list` 数据，`JSON.stringify` 结果随交互变化，`computed` 已能响应式重算高亮。

## 验收与验证

- `pnpm run type-check` 通过（新增 props 需完整类型）。
- `pnpm run lint` 通过且无新增告警。
- `pnpm run build-only` 成功；报告中区分本次新增产物与既有 ECharts chunk 警告。
- 手动核对（导航进入 `/components` 下各页）：
  - Modal / Button / Echarts / Draggable / Drag-Resize 文档页代码块有分层着色；
  - `IconUsageGuide` 五处代码块有高亮；
  - 复制按钮可点击并在短暂反馈后恢复；
  - `DraggableDoc` 拖拽改变 `list` 后 JSON 代码块同步更新且高亮正确。
- 运行 Vite 后检查 `components.d.ts` / `auto-imports.d.ts` 无异常变更（本次显式 import，预期无新增自动注册）。

## TODO 处理

- 经核查 `TODO.md` 当前无 syntax-highlight 相关条目；本计划作为新增能力独立归档。
- 实现完成后，由开发者在 `TODO.md` 追加一条"文档代码块语法高亮"完成项（或相应更新既有文档相关条目），并在 `docs/` 中保留本计划文档。

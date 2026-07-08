# 为 CodeBlock 组件新增文档页

## 目标与范围

为已实现的共享代码块组件 `CodeBlock`（`src/components/CodeBlock.vue`）补充一个组件文档页，使其能从文档站导航直达并被验证，与现有 8 个文档页（icon / layout / modal / button / echarts / draggable / drag-resize / about）保持一致。

范围：

- 新增文档页 `src/views/components-doc/pages/CodeBlockDoc.vue`。
- 在 `src/router/index.ts` 的 `/components` children 中新增 `code-block` 懒加载路由。
- 在 `src/views/components-doc/constants.ts` 的 `navItems` 中新增对应导航项。
- 页面内容演示 `CodeBlock` 的 Props（code / language / showCopy / title）与多语言高亮、复制按钮、隐藏复制、带标题等用法。

不在范围：

- 不修改 `CodeBlock` 组件自身的 API 或实现（本次仅新增演示）。
- 不改动文档站壳 `ComponentsDocView.vue` 与 `DocLayout.vue`。
- 不引入额外依赖。

## 现状问题

- `CodeBlock` 组件已实现并通过校验，但文档站无对应页面，用户无法从导航了解其 Props 与用法。
- 文档站导航 `navItems` 与 `/components` 路由 children 均未收录 `code-block`，入口缺失。

## 推荐方案

### 1. 路由（`src/router/index.ts`）

在 `/components` 的 `children` 中、`drag-resize` 之后、`about` 之前新增：

```ts
{
  path: 'code-block',
  name: 'doc-code-block',
  component: () => import('@/views/components-doc/pages/CodeBlockDoc.vue'),
  meta: { title: '代码块 CodeBlock' }
}
```

### 2. 导航（`src/views/components-doc/constants.ts`）

在 `navItems` 中、`drag-resize` 之后、`about` 之前新增一项（遵循 `NavItem` 结构，无需 icon 字段）：

```ts
{
  key: 'code-block',
  label: '代码块 CodeBlock',
  path: '/components/code-block',
  description: '语法高亮代码块与复制按钮'
}
```

### 3. 文档页（`src/views/components-doc/pages/CodeBlockDoc.vue`）

- 引入 `CodeBlock`：`import CodeBlock from '@/components/CodeBlock.vue'`（与 ModalDoc 等一致，显式 import）。
- 复用文档站现有视觉结构：`.doc-page` / `.doc-page-hero` / `.doc-page-eyebrow` / `.doc-page-title` / `.doc-page-summary` / `.doc-page-alert` / `.doc-table` 等（沿用各页既有 scoped 样式模式，自包含，不抽全局）。
- 内容板块（使用 `data-anchor` 锚点，与各页一致）：
  - 概览：说明基于 `highlight.js` 的语法高亮，支持复制按钮。
  - API 表（`a-table`，列：属性 / 类型 / 默认值 / 说明），覆盖：
    - `code: string`（必填）— 待高亮源码
    - `language?: string`（默认 `'xml'`）— 语言标识
    - `showCopy?: boolean`（默认 `true`）— 是否显示复制按钮
    - `title?: string`（默认 `''`）— 顶部栏标题，缺省时显示语言名
  - 示例（每个示例用 `CodeBlock` 自身渲染，并在其下给出用法源码）：
    - Vue 片段：`language="xml"`（演示模板标签/属性着色）
    - TypeScript：`language="typescript"`
    - JavaScript：`language="javascript"`
    - JSON：`language="json"`
    - Shell：`language="bash"`
    - 隐藏复制：`showCopy=false`
    - 带标题：`title="示例.vue"`
  - 安全提示（沿用 `a-alert` 风格）：`code` 经 highlight.js 转义后渲染，不会执行脚本；源码字符串仍由开发者维护。
- 语言标注与各文档页保持一致：`xml` 用于 `.vue` 片段（已知限制：`<script>` 内 TS 不高亮）；纯 TS 用 `typescript`。

### 4. 复用既有示例源码

为演示，页面内定义若干字符串常量（如 `vueSample`、`tsSample` 等），用 `CodeBlock :code="xxx" language="..."` 渲染；若需在"代码"标签内再展示该常量源码，使用第二个 `CodeBlock` 嵌套展示（字符串模板内需正确处理反引号与 `${}`，必要时用转义或改用 `String.raw`/分块）。保持简洁，优先直接展示效果 + 给出静态用法片段。

## 接口兼容性

- `CodeBlock` 的 Props 已稳定，本页仅消费，不新增或修改组件 API。
- 新增路由 `name: 'doc-code-block'` 不与现有命名冲突。
- `navItems` 新增项字段与 `NavItem` 类型完全匹配。

## 风险

- **嵌套转义**：在示例"代码"中展示含 `<script setup>` / 反引号的源码时，模板字符串需妥善处理转义，避免破坏页面。方案中以静态用法片段为主，降低复杂度。
- **已知高亮限制**：`xml` 对 `.vue` 片段仅着色模板部分，与全局方案一致；文档页内以说明文字提示。
- **样式重复**：新页沿用各页既有 scoped 样式模式，存在与现有页面重复的 `.doc-page*` 类定义；与现状一致，不本次抽全局（遵循"非跨页复用不抽全局"原则）。

## 验收与验证

- `pnpm run type-check` 通过。
- `pnpm run lint` 通过。
- `pnpm run build-only` 成功；报告中区分既有 ECharts chunk 警告与本次新增产物。
- 手动核对：导航出现"代码块 CodeBlock"，进入 `/components/code-block` 可见 API 表与多语言示例；复制按钮可点击；`showCopy=false` 与 `title` 示例表现正确。

## 实施位置与 TODO 处理

- 本任务基于已完成但未合并的 `CodeBlock` 组件实现，将在现有 Worktree `codex/code-block-syntax-highlight` 内追加文档页（不新建 Worktree），最终与组件实现一并合并回 `master`。
- 经核查 `TODO.md` 当前无 CodeBlock 文档相关条目；实现完成后在 `TODO.md` 追加一条"CodeBlock 组件文档页"完成项（或更新既有文档相关条目），并保留本计划文档于 `docs/`。

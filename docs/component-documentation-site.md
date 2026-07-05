# 组件示例文档站 实现计划

> 状态：计划中（开发者已确认本方案，文档由开发者提交到 main 后再进入实现阶段）
>
> 本文档遵循 `AGENTS.md`「计划先行」约束：**只描述方案，不修改运行时代码**。

## 1. 目标与范围

为 `yl-bff-vue3` 建立一个统一的"组件示例文档站"，便于每个组件/能力都有"概述 + 基础示例 + API + 进阶 + 相关链接"的统一文档结构。

- **覆盖范围**：7 个能力 —— Icon、Modal、Button、Echarts、Draggable、DragResize、About。
- **非目标**：OAuth2、路由守卫、按需 antd、ECharts 体积优化（属基线 TODO，不在本任务范围）。

## 2. 现状与痛点

- `src/views/` 现有 7 个演示页零散、无文档结构（只有 `IconView → IconUsageGuide` 有手写排版）。
- `src/router/index.ts` 路由表平铺、无布局壳。
- `src/App.vue` 是简单 `<header><nav>` 纵向链接 + `<RouterView />` + `<YlModalHost />`，无侧边栏。
- `main.ts` 已 `app.use(Antd)` 全量注册，`<a-xxx>` 全部可用；`vite.config.ts` 的 `unplugin-vue-components` 仅配 `IconsResolver`，未配 `AntDesignVueResolver`。
- `docs/` 现有 6 篇计划文档（已归档），无"统一组件文档站"相关内容。

## 3. 推荐方案

### 3.1 路由改造

直接替换原路径（用户已确认），不保留 redirect。`src/router/index.ts` 改为：

```text
/              → HomeView（保留）
/components    → 父路由 component = DocLayout
  ├ ''         → redirect: '/components/icon'
  ├ /icon      → views/components/IconDoc.vue（懒加载）
  ├ /modal     → views/components/ModalDoc.vue
  ├ /button    → views/components/ButtonDoc.vue
  ├ /echarts   → views/components/EchartsDoc.vue
  ├ /draggable → views/components/DraggableDoc.vue
  ├ /drag-resize → views/components/DragResizeDoc.vue
  └ /about     → views/components/AboutDoc.vue
```

- 父路由 `meta: { layout: 'doc', title: '组件文档' }`。
- 子路由 `name: 'doc-icon'` 等，便于编程式跳转与 Anchor 激活判断。

### 3.2 Layout 壳（`src/layouts/DocLayout.vue`）

三段 `a-layout`：

- **Header**（`a-layout-header`）：项目 logo（`RouterLink to="/components"`）+ 当前章节名（`route.meta.title`）+ "回到主站"按钮（`RouterLink to="/"`）。
- **Sider**（`a-layout-sider`，width 220）：列出 7 个能力 + 1 个首页 `RouterLink`。
- **Content**（`a-layout-content`）：顶部 `a-affix :offset-top="0"` 包 `a-anchor`（`:items="anchorItems"`、`:target-offset="64"`、`affix`），下方 `<RouterView />` 渲染子页。

**Anchor 联动机制**：
- 子页内每个章节标题用 `<a-typography-title :id="slug" :level="2">`。
- 子页 `onMounted` 内 `nextTick` 后用 `document.querySelectorAll('main.doc-page [id]')` 动态构建 `anchorItems`，路由切换时刷新。
- 锚点目标元素加 `scroll-margin-top: 64px`（Layout scoped 内）防被 header 遮挡。

**视觉一致性**：在 `DocLayout.vue` 内 `:root` 重新声明 `IconUsageGuide` 的 CSS Variables（`--ink / --accent / --surface / --muted / --line`），两套视觉保持一致。

### 3.3 通用子页模板

```text
<a-typography-title :id="overview" :level="2">概述</a-typography-title>
<a-typography-paragraph>…</a-typography-paragraph>
<a-alert type="info">何时使用 / 何时不用</a-alert>

<a-typography-title :id="basic" :level="2">基础示例</a-typography-title>
<a-tabs v-model:active-key="basicTab">
  <a-tab-pane key="preview" tab="预览"><a-card>…实际组件…</a-card></a-tab-pane>
  <a-tab-pane key="code" tab="代码"><pre><code>{{ source }}</code></pre></a-tab-pane>
</a-tabs>

<a-typography-title :id="api" :level="2">API</a-typography-title>
<a-table :columns="apiCols" :data-source="apiRows" :pagination="false" />
<!-- 列：name / type / default / description -->

<a-typography-title :id="advanced" :level="2">进阶示例</a-typography-title>  <!-- 可选 -->
<a-typography-title :id="links" :level="2">相关链接</a-typography-title>
```

### 3.4 7 个子页内容映射

| 子页 | 源文件 | 处理 |
|---|---|---|
| `IconDoc.vue` | `components/IconUsageGuide.vue` | **整段引入不拆**，外包 `<main class="doc-page">`；anchor items 动态扫描 |
| `ModalDoc.vue` | `views/ModalView.vue` + `views/ModalViewOptions.vue` + `components/Modal/ModalContextProbe.vue` | 重组 6 小节：声明式 / API(`Modal.open`) / 选项式(`component+componentProps`) / 上下文（`ModalContextProbe`）/ `trustedHtml` / 拖拽缩放 |
| `ButtonDoc.vue` | `views/ButtonView.vue` | 套模板；API 节用 `a-table` 列 button 修饰类 |
| `EchartsDoc.vue` | `views/EchartsView.vue` | 保留 `onMounted`/`onBeforeUnmount dispose`/`ResizeObserver`（裸 `setTimeout` 不再使用）；新增"按需注册"小节指向 `core/echarts-import.ts` |
| `DraggableDoc.vue` | `views/DraggableView.vue` | 套模板 |
| `DragResizeDoc.vue` | `views/DragResizeView.vue` | 套模板 |
| `AboutDoc.vue` | `views/AboutView.vue` | 轻量改写为"项目说明 + 7 能力索引" |

### 3.5 App.vue 改造

纵向 nav 顶部插入 `<a-button type="primary"><RouterLink to="/components">文档</RouterLink></a-button>`，导航链接保持 7 个能力 + 1 个首页。`<YlModalHost />` 仍在最末。

### 3.6 全局样式

**Layout 与子页都用 `<style scoped>`**，不新增 `src/assets/css/doc-layout.css`。理由：Layout 单实例、scoped 足够；按钮基础样式已在 `src/assets/css/button.css`。响应式断点（`@media max-width: 768px` 隐藏 sider、anchor 折到顶部）写在 `DocLayout.vue` scoped 内。

## 4. 接口兼容性

- **路由路径不兼容**：用户已确认"直接替换原路径"，原 `/icon`、`/modal` 等会 404。README 与任何外部分享需在交付后同步更新。
- **AGENTS.md 约束**：修改 Modal 演示页时需保留 `ModalView` 内部 `import AboutView` 等 import 链路（ModalDoc 中保留）。
- **YlModalHost 仍挂 App.vue**：嵌套路由不影响全局 Host（满足"Host 不能随路由卸载"硬约束）。

## 5. 风险

- **断链**：原 `/icon`、`/modal` 等路径直接被 `/components/<x>` 替换，外部链接会 404。
- **`a-anchor` + `a-affix` 配合**：锚点目标需 `scroll-margin-top: 64px` 防被 header 遮挡。
- **Modal 演示页 import 链路**：迁移时需保留 `AboutView`、`ModalViewOptions`、`ModalContextProbe` 的 import。
- **IconUsageGuide CSS 变量作用域**：原作用域为 `.icon-guide` 的 `<style scoped>`，Layout 重声明同名变量即可。
- **YlModalHost 嵌套路由**：仍挂 `App.vue`，不被嵌套路由卸载。

## 6. 验收与验证

- `pnpm run type-check` 通过。
- `pnpm run lint` 通过（ESLint 9 flat config）。
- `pnpm run build-only` 通过（ECharts 562 kB 警告属基线问题，不在本任务修复范围）。
- 手动验证（开发环境）：访问 `/components` 默认跳到 `/components/icon`，7 个子页均能渲染，Anchor 吸顶工作，`<a-tabs>` 切换预览/代码正常。

## 7. 关键修改文件

- 新增：`src/layouts/DocLayout.vue`
- 新增：`src/views/components/{IconDoc,ModalDoc,ButtonDoc,EchartsDoc,DraggableDoc,DragResizeDoc,AboutDoc}.vue`
- 改：`src/router/index.ts`（重写路由表）
- 改：`src/App.vue`（导航链接 + 文档入口）
- 删除：`src/views/IconView.vue`、`ModalView.vue`、`ModalViewOptions.vue`、`ButtonView.vue`、`EchartsView.vue`、`DraggableView.vue`、`DragResizeView.vue`、`AboutView.vue`（**HomeView.vue 保留**）

## 8. 实施步骤

1. 本计划文档由开发者提交到 main（计划阶段只动 docs/）。
2. 创建 worktree：`git worktree add .worktree/codex-doc-site -b codex/doc-site`。
3. 新增 `src/layouts/DocLayout.vue`。
4. 迁移 7 个子页到 `src/views/components/`，按 3.3 模板与 3.4 映射重排。
5. 改造 `src/router/index.ts`。
6. 改造 `src/App.vue`。
7. 删除老 view 文件。
8. 校验三件套（type-check/lint/build-only），区分基线失败与新失败。
9. 生成报告（修改文件/核心逻辑/风险点/Diff 摘要），**不自动合并**。

## 9. 相关 TODO

- 本任务完成后，原 `README.md` 中"框架功能"小节提到的演示页链接需同步替换为 `/components/<x>`（属后续任务，不在本计划范围）。

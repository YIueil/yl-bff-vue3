# 三栏应用布局与 Layout 文档计划

> 状态：计划中
>
> 本文档遵循 `AGENTS.md` 的“计划先行”约束。计划阶段只新增本文并更新
> `TODO.md` 链接，不修改运行时代码。

## 1. 目标与范围

新增一种类似参考图的后台应用布局：整体由左侧 `sider`、中间 `content`、右侧 `sider` 组成，两侧
均可通过按钮折叠和展开，并适配移动端。布局内部使用示例组件和静态数据渲染一个可直接查看的
Dashboard 页面。

同时新增 Layout 文档页，将当前已有的文档型布局 `DocLayout` 与本次新增的三栏应用布局写入文档，
并接入现有组件文档站导航。

本次目标：

- 新增可复用的三栏应用布局组件，支持左、右两侧栏独立折叠。
- 新增基于示例数据的三栏 Dashboard 示例页面或示例组件。
- 移动端下侧栏不挤压内容，改为抽屉/浮层式显示，并支持遮罩、Esc 和路由切换关闭。
- 新增 `/components/layout` 文档页，说明并演示目前两种 layout。
- 更新组件文档站左侧导航和路由。

本次范围：

- 新增 `src/layouts/ThreeColumnLayout.vue` 或同等命名的布局组件。
- 新增三栏布局示例所需的局部组件、类型和静态数据。
- 新增 `src/views/components-doc/pages/LayoutDoc.vue`。
- 更新 `src/views/components-doc/constants.ts` 与 `src/router/index.ts`。
- 必要时新增与文档页相关的局部样式。

非目标：

- 不引入新的 UI 框架或图表库。
- 不实现真实后端数据、登录、权限或动态菜单。
- 不替换当前组件文档站自身使用的 `DocLayout`。
- 不把当前参考图完全 1:1 复刻为生产系统，只实现布局能力与可验证示例。
- 不新增全局主题系统。

## 2. 现状问题

当前仓库只有 `src/layouts/DocLayout.vue`：

- 它已经收敛为文档站布局壳，适合组件文档页使用。
- 它的结构是顶部 Header、左侧文档导航、中间文档内容、右侧目录，不是通用后台工作台布局。
- 现有文档站没有 Layout 专属文档页，也没有集中说明当前项目有哪些布局。

因此新增“左侧 sider + content + 右侧 sider”的后台布局时，不应继续扩展 `DocLayout`，否则会重新
混入不同场景的布局职责。

## 3. 推荐方案

采用“布局组件 + 示例数据 + 文档页”的方式实现。

建议新增结构：

```text
src/layouts/
  ThreeColumnLayout.vue

src/views/components-doc/
  layout-demo-data.ts
  pages/
    LayoutDoc.vue
```

如 `LayoutDoc.vue` 过大，可在同目录下增加局部演示组件：

```text
src/views/components-doc/components/
  ThreeColumnDashboardDemo.vue
```

是否拆出 `ThreeColumnDashboardDemo.vue` 以实现时文件体量为准：如果文档说明和 demo 模板混在一起
明显过长，则拆；否则保持单页，避免过度拆分。

### 3.1 ThreeColumnLayout 职责

`ThreeColumnLayout.vue` 只负责三栏应用布局结构和交互状态入口：

- 外层应用 Shell。
- 左侧栏、主内容、右侧栏三个区域。
- 左右侧栏桌面端折叠宽度与展开宽度。
- 移动端左右侧栏浮层展示、遮罩层和基础响应式样式。
- 通过 props 控制：
  - `leftOpen`
  - `rightOpen`
  - `leftWidth`
  - `rightWidth`
  - `isMobile`
- 通过事件暴露：
  - `toggle-left`
  - `toggle-right`
  - `close-left`
  - `close-right`
- 通过 slots 接收：
  - `left`
  - `topbar`
  - default content
  - `right`

布局组件不负责业务数据、菜单项、通知列表、联系人列表或图表数据。

### 3.2 示例 Dashboard 职责

示例内容负责渲染参考图风格的静态 Dashboard：

- 左侧 sidebar：品牌、收藏、Dashboard 菜单、页面分组等示例导航。
- 顶部栏：面包屑、搜索框、左右侧栏折叠按钮和少量工具按钮。
- 主内容：概览指标卡、折线趋势图、站点流量、设备流量、地区流量等静态展示。
- 右侧 sidebar：通知、活动、联系人等示例列表。

图表优先使用 CSS/SVG 静态可视化或现有 ECharts 按需能力。若使用 ECharts，必须通过
`@/core/echarts-import` 注册后的入口，不直接导入完整 `echarts` 包。考虑本需求重点是布局，推荐
先使用 CSS/SVG 静态图形降低复杂度和包体风险。

### 3.3 移动端行为

建议断点：

- `>= 1200px`：左右侧栏按占位栏显示，折叠时宽度为 `0` 或紧凑 rail。
- `< 1200px`：右侧栏默认折叠，点击按钮以浮层从右侧进入。
- `< 768px`：左侧栏也默认折叠，点击按钮以浮层从左侧进入；内容占满宽度。

移动端交互：

- 打开任意侧栏时显示遮罩。
- 点击遮罩关闭当前打开的侧栏。
- Esc 关闭移动端打开的侧栏。
- 路由切换时关闭移动端侧栏。
- 两侧栏同时打开时，后打开的一侧优先显示；实现可选择打开一侧时关闭另一侧。

### 3.4 Layout 文档页

新增 `/components/layout`：

- `name: 'doc-layout'`
- `meta.title: '布局 Layout'`

文档内容至少包含：

- `DocLayout`：说明用途、区域结构、当前使用位置、适用场景。
- `ThreeColumnLayout`：说明用途、区域结构、折叠能力、移动端行为。
- 嵌入三栏 Dashboard 示例，使布局可以从文档站直接验证。
- 简要列出核心 props / events / slots。

同时更新 `navItems`，建议将“布局 Layout”放在 Icon 之后或 About 之前。

## 4. 接口兼容性

- 现有 `/components/*` 路由保持不变。
- 现有 `DocLayout` API 和组件文档站行为不应被破坏。
- 新增 `/components/layout` 是向后兼容的路由扩展。
- 新布局组件是新增 API，不影响当前页面。
- 示例数据为静态本地数据，不新增环境变量或外部请求。

## 5. 风险与控制

- **布局复杂度膨胀**：三栏布局只保留结构和交互，不内置业务导航数据；示例数据留在文档/示例层。
- **移动端遮挡或溢出**：必须在窄屏下验证左右侧栏浮层、遮罩、按钮和主内容滚动。
- **样式污染**：布局和示例默认使用 scoped CSS；不把示例样式放入全局 CSS。
- **图表依赖扩大**：优先使用 CSS/SVG 静态图形；若使用 ECharts，沿用现有按需入口。
- **文档页过大**：实现时如 `LayoutDoc.vue` 过长，可拆出局部 demo 组件和静态数据文件。
- **参考图可访问性不足**：折叠按钮需要明确 `aria-label`、`aria-expanded`，浮层遮罩需要可关闭。

## 6. 验收与验证

自动校验：

- `pnpm run type-check`
- `pnpm run lint`
- `pnpm run build-only`

手工验收：

- `/components/layout` 能正常访问，并显示两种 layout 的文档说明。
- 三栏示例在桌面端显示左侧 sider、content、右侧 sider。
- 左侧折叠按钮能收起/展开左侧 sider。
- 右侧折叠按钮能收起/展开右侧 sider。
- 窄屏下左右侧栏以浮层方式显示，不挤压主内容。
- 遮罩点击、Esc、路由切换能关闭移动端侧栏。
- 1440px、1024px、768px、375px 下无明显遮挡或横向溢出。
- 当前 `/components/icon`、`/components/modal` 等文档页仍可正常访问。

## 7. 预计修改文件

- 新增：`src/layouts/ThreeColumnLayout.vue`
- 新增：`src/views/components-doc/pages/LayoutDoc.vue`
- 可选新增：`src/views/components-doc/components/ThreeColumnDashboardDemo.vue`
- 可选新增：`src/views/components-doc/layout-demo-data.ts`
- 修改：`src/views/components-doc/constants.ts`
- 修改：`src/router/index.ts`
- 实现完成后修改：`TODO.md`（验收全部通过后勾选对应条目）

## 8. 实施步骤

1. 开发者审核本文并在当前主分支提交本文及 `TODO.md` 链接。
2. 从最新目标分支创建 `.worktree/codex/three-column-app-layout`，分支名为
   `codex/three-column-app-layout`。
3. 新增 `ThreeColumnLayout.vue`，实现左右侧栏 slots、折叠 props/events 和移动端外壳。
4. 新增示例静态数据和三栏 Dashboard 示例。
5. 新增 `LayoutDoc.vue`，写入 `DocLayout` 和 `ThreeColumnLayout` 文档，并嵌入示例。
6. 更新组件文档导航和 `/components/layout` 路由。
7. 运行自动校验并完成手工验收。
8. 验收通过后更新 `TODO.md` 状态，使用临时 Codex 身份创建 Conventional Commit。
9. 输出修改文件、核心逻辑、风险点和 Diff 摘要；不自动合并。

## 9. TODO 处理方式

本任务新增 `TODO.md` 低优先级“新增三栏应用布局与 Layout 文档”条目。计划阶段只添加本文链接并保持
未完成；实现、自动校验和手工验收全部通过后，才将其标记为完成。

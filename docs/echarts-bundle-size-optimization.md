# ECharts 打包体积优化计划

## 目标与范围

降低 `/echarts` 路由对应的生产构建体积，在保持现有柱状图功能和生命周期行为不变的前提下：

- 移除当前页面未使用的 ECharts 运行时模块。
- 保持 ECharts 只在访问 `/echarts` 路由时加载，不增加首屏同步依赖。
- 消除 Vite 针对 ECharts 页面产物超过 500 kB 的 chunk size 警告。
- 建立可复核的优化前后 raw 与 gzip 体积对比，避免仅通过拆分文件或提高警告阈值掩盖问题。

本任务不新增图表类型，不封装通用 ECharts 组件或 composable，也不调整现有页面的 option、样式、
resize 和 dispose 行为。

## 现状问题

当前生产构建生成的 `EchartsView-*.js` 为 561,847 bytes，gzip 后为 191,277 bytes，并触发 Vite
默认的 500 kB chunk size 警告。

路由已经通过 `component: () => import('../views/EchartsView.vue')` 懒加载，因此该产物不会进入
首页同步入口。主要问题不是缺少路由级异步加载，而是 `src/core/echarts-import.ts` 注册的能力明显
多于当前页面实际使用的能力：

| 当前运行时模块 | 页面是否使用 | 计划处理 |
| --- | --- | --- |
| `BarChart` | 是 | 保留 |
| `TitleComponent` | 是 | 保留 |
| `TooltipComponent` | 是 | 保留 |
| `GridComponent` | 是，直角坐标系依赖 | 保留 |
| `CanvasRenderer` | 是 | 保留 |
| `LineChart` | 否 | 移除 |
| `DatasetComponent`、`TransformComponent` | 否，页面直接提供轴和系列数据 | 移除 |
| `LabelLayout`、`UniversalTransition` | 否 | 移除 |

`ECOption` 同时组合了未使用的 `LineSeriesOption` 和 `DatasetComponentOption`。类型声明虽然不会直接
进入运行时产物，但它允许调用方配置当前注册表并不保证可用的能力，使类型边界与运行时边界不一致。

## 推荐方案

### 精确注册当前页面所需模块

继续使用 ECharts 官方的 `echarts/core`、`echarts/charts`、`echarts/components` 和
`echarts/renderers` tree-shaking 入口，在 `src/core/echarts-import.ts` 中只保留：

- `BarChart`
- `TitleComponent`
- `TooltipComponent`
- `GridComponent`
- `CanvasRenderer`

同步收窄 `ECOption` 的组合类型，移除 `LineSeriesOption` 和 `DatasetComponentOption`。保留现有
`echarts-import.ts` 路径、默认导出和 `ECOption` 名称，避免为了单个现有消费者引入额外抽象或文件迁移。

若首次实现后的生产构建仍超过 500 kB，应先使用构建结果确认剩余模块组成，再在同一 Worktree 中评估
`SVGRenderer` 与 `CanvasRenderer` 对本示例的实际体积差异。只有 SVG renderer 能带来足以消除警告的
净收益，且手工验证显示渲染和 resize 行为等价时，才切换 renderer；否则记录数据并保留 Canvas。

### 保持现有异步边界

保留路由级动态导入。当前只有一个 ECharts 消费页面，在 `onMounted()` 内再次动态导入，或通过
`manualChunks` 强制创建 ECharts vendor chunk，会改变文件边界，但访问页面时仍需下载同一批代码，
不会直接减少总体积，还会增加加载状态和错误处理复杂度，因此本任务不采用。

如果未来出现多个独立图表页面，应按图表能力建立功能级注册模块，并重新评估共享 vendor chunk 的缓存
收益。该设计不应在只有一个消费者时提前引入。

### 不以配置隐藏警告

不提高 `build.chunkSizeWarningLimit`，也不以“每个拆分文件都小于 500 kB”替代总体积优化。验收同时
比较 ECharts 路由入口及其新增专属依赖 chunk 的 raw 与 gzip 总量，防止仅靠机械拆包通过检查。

## 接口兼容性

- `/echarts` 路由、页面 DOM、图表 option、展示数据和交互行为保持不变。
- `@/core/echarts-import` 的默认导出及 `ECOption` 类型名称保持不变。
- `ECOption` 将不再接受折线图和 dataset 配置。这与当前实际注册能力和仓库内唯一调用方一致，但属于
  类型能力的有意收窄；未来新增对应功能时，必须同时恢复实现注册和 Option 类型。
- 不新增依赖，不修改 `package.json` 或 `pnpm-lock.yaml`。
- 不修改 Vite 的 chunk 警告阈值。

## 风险与应对

### 间接依赖被误删

直角坐标系柱状图依赖 Grid，因此不能仅凭 option 中没有显式 `grid` 字段就移除
`GridComponent`。实现后需验证坐标轴、tooltip 和柱体均正常显示，并检查浏览器控制台是否报告组件未注册。

### 类型与运行时注册再次偏离

后续新增图表类型时，只添加 Option 类型或只添加 `echarts.use()` 模块都会形成不完整集成。实现应保持
类型 import、运行时 import 和 `echarts.use()` 列表紧邻，代码审查和手工验证同时检查三者。

### 体积下降不足

删除未使用模块预计会直接减少产物，但最终结果以当前锁定依赖的实际构建为准。若仍超过阈值，按推荐方案
对 renderer 做隔离对比；不得直接提高警告阈值或无依据地拆分 chunk。若两种 renderer 都无法达标，
应在报告中列出 raw/gzip 数据和剩余模块边界，再由开发者确认是否扩大任务范围。

### Renderer 行为差异

SVG 与 Canvas 在大量元素性能、DOM 结构和渲染细节上不同，因此 renderer 切换只是有数据支撑时的
后备方案。当前小型柱状图需验证 tooltip、窗口缩放、路由往返和清理行为，不以截图相似作为唯一依据。

## 验收与验证方式

### 构建体积

实现前基线：

- `dist/assets/EchartsView-CniinCKq.js`：561,847 bytes
- gzip：191,277 bytes

实现后执行干净的生产构建并记录哈希文件名、raw bytes 和 `gzip -c` 结果。验收要求：

1. ECharts 路由入口及因本任务新增的专属依赖 chunk 中，单个文件均不超过 500 kB，不再出现对应警告。
2. 上述 ECharts 专属 JavaScript 的 raw 总量低于 561,847 bytes。
3. 上述 ECharts 专属 JavaScript 的 gzip 总量低于 191,277 bytes。
4. 首页入口 chunk 不因本任务引入 ECharts 运行时代码或出现显著体积增长。

若构建哈希或其他既有代码变化导致文件名不同，应按路由入口及其静态依赖关系识别产物，不依赖固定文件名。

### 静态与命令验证

实现完成后至少执行：

```bash
pnpm run type-check
pnpm run lint
pnpm run build-only
```

同时检查：

- `echarts-import.ts` 不再运行时导入或注册 Line、Dataset、Transform、LabelLayout 和
  UniversalTransition。
- `ECOption` 只声明已注册且当前页面需要的图表和组件类型。
- `git diff` 不包含自动生成声明、依赖锁文件、`dist/` 或其他无关文件。

### 手工验证

1. 首次打开首页，确认网络请求中没有 ECharts 路由专属产物。
2. 导航到 `/echarts`，确认标题、坐标轴、柱体和 tooltip 正常显示，控制台无缺失模块错误。
3. 改变容器或浏览器宽度，确认图表继续响应 `ResizeObserver` 并正确 resize。
4. 在 `/echarts` 与其他路由之间多次往返，确认图表可重复初始化和销毁，无运行时错误。
5. 若切换 renderer，额外检查生成的渲染节点与预期 renderer 一致，并执行上述全部交互验证。

## TODO 处理

计划阶段只将 `TODO.md` 中“优化 ECharts 打包体积”条目链接到本文并保持未完成。只有开发者确认并提交
计划、实现阶段在隔离 Worktree 中完成、验证通过且实现提交已经生成后，才能将对应 TODO 标记为完成。

“封装可复用的 ECharts 组件或 composable”继续保持为独立 TODO。本任务不借体积优化提前引入公共
抽象。

## 实施结果

基于计划提交 `0a7c3b9` 在隔离 Worktree 中执行生产构建，得到可复现基线：

- `EchartsView-CysC4mPm.js`：562.08 kB，gzip 192.21 kB。
- 首页 `index-BZTehQcS.js`：291.40 kB，gzip 110.24 kB。
- Vite 报告 ECharts chunk 超过 500 kB。

移除未使用模块后的构建结果：

- `EchartsView-C2nayPx2.js`：497.81 kB，gzip 168.51 kB。
- 首页 `index-BSZxfE42.js`：291.40 kB，gzip 110.24 kB。
- ECharts chunk 的 raw 体积减少约 64.27 kB（11.4%），gzip 减少约 23.70 kB（12.3%）。
- Vite 不再报告 chunk 超过 500 kB，因此无需评估或切换 renderer。

`pnpm run type-check`、`pnpm run lint` 和 `pnpm run build-only` 均已通过。无头 Chrome
交互验证结果：

- 1280 × 900 视口下图表标题、坐标轴和六组柱状数据正常渲染。
- 模拟鼠标移动后 tooltip 正确显示“雪纺衫 36”。
- 将视口宽度从 1280 调整为 800 后，canvas 宽度从 1264 px 调整为 772 px。
- 通过页面导航执行 `/echarts` → `/` → `/echarts` 往返后，canvas 成功重新创建。
- Chrome DevTools Protocol 收集到的控制台错误和运行时异常数量均为 0。

此前无头 Firefox 因软件渲染器错误未能生成截图；改用 Chrome 后已完成等价验收，该 Firefox 环境问题
与应用功能无关。

## 实施步骤

- [x] 开发者确认并在当前主分支提交本计划及 TODO 链接。
- [x] 从包含计划提交的最新目标分支创建 `codex/` 前缀分支和对应 Worktree。
- [x] 在 Worktree 中配置 Codex Git 身份。
- [x] 记录 Worktree 中可复现的构建体积基线。
- [x] 裁剪未使用的运行时模块并同步收窄 `ECOption`。
- [x] 构建结果已低于 500 kB，无需评估或切换 renderer。
- [x] 执行类型检查、lint、生产构建和体积对比。
- [x] 完成 `/echarts` 页面渲染、tooltip、resize 和路由往返的浏览器交互验收。
- [x] 将对应 TODO 标记为完成，提交符合 Conventional Commits 的实现提交。
- [ ] 输出修改文件、核心逻辑、风险点和 Diff 摘要，不自动合并。

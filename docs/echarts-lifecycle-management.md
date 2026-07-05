# ECharts 生命周期管理修复计划

## 目标与范围

修复 `src/views/EchartsView.vue` 中 ECharts 实例与 Vue 组件生命周期脱节的问题，使图表：

- 仅在组件挂载、容器 DOM 可用后初始化。
- 在组件卸载前停止尺寸监听并销毁 ECharts 实例。
- 在图表容器尺寸变化时调用 `resize()`。
- 不再依赖无延时参数的 `setTimeout()` 猜测 DOM 是否已准备完成。

本任务只完善现有 ECharts 演示页的生命周期管理，不调整
`src/core/echarts-import.ts` 的按需模块注册，不新增依赖，也不处理 ECharts 页面约 562 kB
的构建产物体积问题。可复用 ECharts 组件或 composable 仍作为独立 TODO 保留，避免在修复单页缺陷时
提前确定公共抽象。

## 现状问题

当前 `EchartsView.vue` 在 `<script setup>` 执行期间注册一个无延时参数的 `setTimeout()`，并在回调中
初始化图表。该实现存在以下问题：

1. 定时器只是在后续宏任务中执行，不能表达“组件已经挂载且容器可以安全使用”的生命周期约束。
2. `echartsDom.value` 的类型允许为空，但初始化时未显式校验，实际安全性依赖定时器执行时机。
3. 路由离开后没有调用 `dispose()`，ECharts 内部事件和渲染资源可能继续占用内存。
4. 容器大小变化时没有调用 `resize()`，图表尺寸可能与页面布局不一致。
5. ECharts 实例保存在普通深层 `ref` 中，没有必要让 Vue 深度代理第三方实例对象。

## 推荐方案

### 初始化

- 将图表 option 保持为明确的 `ECOption` 类型。
- 使用 `shallowRef<EChartsType | null>` 保存实例，避免深度代理 ECharts 对象。
- 在 `onMounted()` 中读取并校验 `echartsDom`，然后调用 `echarts.init()` 和 `setOption()`。
- 不保留 `setTimeout()` 或其他基于时间的 DOM 就绪推断。

### 响应容器尺寸

- 在图表初始化完成后，为实际容器创建原生 `ResizeObserver`。
- observer 回调通过当前实例调用 `resize()`，使侧栏、父容器或视口引起的容器尺寸变化都能触发重绘。
- 监听容器而不是只监听 `window.resize`，因为容器尺寸变化不一定伴随窗口尺寸变化。

项目目标浏览器需支持 `ResizeObserver`。本次不引入 polyfill；如后续需要支持缺少该 API 的旧浏览器，
应单独明确兼容范围并选择 polyfill。

### 清理

在 `onBeforeUnmount()` 中按以下顺序清理：

1. 调用 `ResizeObserver.disconnect()` 并清空 observer 引用，阻止后续 resize 回调。
2. 对现有 ECharts 实例调用 `dispose()`。
3. 将实例引用重置为 `null`。

清理逻辑应允许引用为空，避免初始化未完成或挂载异常时产生二次错误。

## 接口兼容性

- 不新增或修改公共 API、组件 props、事件、路由和环境变量。
- 不修改 `ECOption` 或 ECharts 按需注册模块。
- 页面路径、图表标题、坐标轴和示例数据保持不变。
- 不新增依赖或修改锁文件。
- 运行时要求增加为浏览器原生支持 `ResizeObserver`，与当前现代 Vue 3/Vite 应用定位一致。

## 风险与应对

### 隐藏容器或零尺寸初始化

当前路由页面正常展示时容器具有 `min-height: 400px`，挂载时可获得有效尺寸。本任务不处理
`display: none` 容器恢复显示的通用场景；若未来将图表放入标签页、折叠面板或隐藏 Modal，应由公共
ECharts 组件或 composable 补充可见性恢复策略。

### ResizeObserver 高频触发

ECharts 的 `resize()` 可能进一步影响布局。当前页面结构简单，预期不会形成循环；实现和手工验证时
需观察浏览器控制台是否出现 `ResizeObserver loop` 警告。若出现，应另行评估基于动画帧的合并调用，
而不是在没有证据时增加调度复杂度。

### 重复初始化与资源泄漏

Vue Router 往返页面会创建新的组件实例。`onMounted()` 初始化和 `onBeforeUnmount()` 清理必须成对，
并确保旧 observer 不再持有已卸载容器。

### 构建体积

生命周期修复不会减少现有 ECharts chunk 体积，`pnpm run build-only` 预计仍会出现 500 kB chunk
警告。该警告属于已有基线，应与本次修改引入的失败区分报告。

## 验收方式

### 静态检查

- `EchartsView.vue` 中不再存在 `setTimeout()`。
- 初始化代码只从 `onMounted()` 进入。
- `onBeforeUnmount()` 中同时断开尺寸监听并调用 `dispose()`。
- 不产生自动生成声明、依赖或锁文件变更。

### 手工验证

1. 打开 `/echarts`，确认柱状图正常显示，控制台无初始化错误。
2. 改变浏览器宽度，确认图表随容器宽度变化且坐标内容正常重排。
3. 若开发者工具支持，改变父容器尺寸但不触发 window resize，确认图表仍会重排。
4. 从 `/echarts` 导航到其他页面，再返回 `/echarts`，确认图表可重复初始化且控制台无已销毁实例、
   重复初始化或 `ResizeObserver` 相关错误。
5. 多次执行上述路由往返，确认没有遗留 canvas、observer 回调或明显递增的 ECharts 实例资源。

### 命令验证

实现完成后至少执行：

```bash
pnpm run type-check
pnpm run lint
pnpm run build-only
```

`build-only` 中已知的 ECharts chunk size 警告不视为本任务失败，但必须记录在实现报告中；任何新增的
类型、lint 或构建错误均需修复。

## TODO 处理

计划阶段只将 `TODO.md` 中对应条目链接到本文，保持未完成状态。只有运行时代码在隔离 Worktree 中
实现，并通过上述静态、命令及手工验收后，才能将该 TODO 标记为完成。

以下相关事项不在本任务中关闭：

- “优化 ECharts 打包体积”。
- “封装可复用的 ECharts 组件或 composable”。

## 实施步骤

- [x] 开发者确认并在当前主分支提交本计划及 TODO 链接。
- [x] 从包含计划提交的最新目标分支创建 `codex/` 前缀分支和对应 Worktree。
- [x] 在 Worktree 中配置 Codex Git 身份。
- [x] 修改 `EchartsView.vue`，实现 mounted 初始化、容器 resize 监听和卸载前清理。
- [x] 执行类型检查、lint、生产打包及手工生命周期验证。
- [x] 将对应 TODO 标记为完成，提交符合 Conventional Commits 的实现提交。
- [ ] 输出修改文件、核心逻辑、风险点和 Diff 摘要，不自动合并。

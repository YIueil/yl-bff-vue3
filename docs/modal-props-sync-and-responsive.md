# Modal props 同步、窗口 resize、超小视口、最小化排列与移动端触控适配

## 目标与范围

补齐当前 `YlModal` 在响应式与移动端体验上的缺口，覆盖 TODO 中列出的五项能力：

1. **props 与内部状态同步**：`showMask`/`showBody`/`showFooter`/`resizable`/`draggable`
   当前仅在 `setup` 时从 props 读取一次，运行时修改 prop 不会反映。改为对 props 响应式
   派生，并在最小化态以内部状态覆盖。
2. **窗口 resize 适配**：视口尺寸变化时，正常态窗口被约束在视口内（不溢出、不丢出屏幕），
   最大化态跟随新视口，最小化态重新贴底排列。
3. **超小视口适配**：视口宽度低于断点（默认 640px）时，正常态窗口铺满视口（含安全边距），
   并禁用拖拽/缩放，仅保留内容滚动。
4. **最小化排列**：多个窗口最小化时，在底部以水平等距任务条方式排列，而非全部重叠在左下角。
5. **移动端触控适配**：头部按钮与内容区补充 `touchstart` 阻止，避免触屏点按误触发拖拽；
   复用 `vue3-draggable-resizable` 既有的 `touchstart/touchmove` 触控拖拽能力。

本任务只完善 `YlModal` 表现层、`ModalManager` 最小化登记、Host 传 key，不改动 Modal 的
三层结构、单例边界、重复 key 语义、关闭/隐藏链路与可信 HTML 约束，不新增公共 API 之外的
对外契约（仅向 `ModalManagerInterface` 增补最小化登记方法以保持类型完整）。

## 现状问题

- `YlModal.vue:123-127` 中 `localShowMask/localShowBody/localShowFooter/localResizable/localDraggable`
  用 `ref(props.xxx)` 一次性初始化；例如声明式演示中切换 `showFooter` 不会让页脚隐藏。
- 位置/尺寸仅在 `onMounted` 与最小化/最大化切换时计算，视口 resize 时不重新约束，窗口可能
  溢出或被推到屏幕外。
- 默认尺寸写死 `900 x 560`，小屏下超出视口且未做响应式收敛。
- 最小化时固定 `(0, viewportH - 36)`（`YlModal.vue:149-150`），多个最小化窗口完全重叠。
- 头部按钮与 body/footer 仅用 `@mousedown.stop` 阻止拖拽，触屏 `touchstart` 未被阻止，
  移动端点按按钮可能误触发拖拽；触屏下拖拽依赖库自身能力，未做适配确认。

## 推荐方案

### 1. props 响应式派生（解决“props 与内部状态同步”）

删除一次性 `ref(props.xxx)`，改为 computed，并以 `minimize` 作为内部覆盖：

```ts
const localShowMask = computed(() => !minimize.value && props.showMask)
const localShowBody = computed(() => !minimize.value && props.showBody)
const localShowFooter = computed(() => !minimize.value && props.showFooter)
const localResizable = computed(
  () => !minimize.value && !maximize.value && props.resizable && !isMobile.value
)
const localDraggable = computed(
  () => !minimize.value && props.draggable && !isMobile.value && !maximize.value
)
```

模板中 `localShowMask/localShowBody/localShowFooter/localResizable/localDraggable` 维持原引用，
无需改动模板结构。`props.showXxx` 变化即驱动更新，满足“运行时修改 prop 同步”。

### 2. 统一视口尺寸与响应式默认尺寸

`setup` 顶部使用单一 `const { width: vw, height: vh } = useWindowSize()`（替换原多处重复调用）。
定义常量：`MARGIN = 24`、`SMALL_BREAKPOINT = 640`、`MIN_W = 320`、`MIN_H = 200`、
`MINIMIZED_W = 200`、`MINIMIZED_H = 36`、`GAP = 8`。

```ts
const isMobile = computed(() => vw.value < SMALL_BREAKPOINT)
const defaultW = computed(() => clamp(initW.value, MIN_W, vw.value - MARGIN * 2))
const defaultH = computed(() => clamp(initH.value, MIN_H, vh.value - MARGIN * 2))
```

### 3. 布局函数与 resize 监听

抽出纯布局函数，避免分散赋值：

- `applyCentered()`：正常态取 `defaultW/defaultH` 并居中。
- `applyMaximized()`：`w=vw, h=vh, x=0, y=0`。
- `applyMinimized(index, total)`：`w=MINIMIZED_W, h=MINIMIZED_H`，
  `x = index * (MINIMIZED_W + GAP)`，`y = vh - MINIMIZED_H`。
- `clampToViewport()`：仅约束（不强行居中）——若 `w/h` 超过视口可用区则收缩，
  并将 `x/y` 收敛到 `[0, vw-w]/[0, vh-h]`，保留用户拖拽后的位置。

`onMounted` 中按当前模式首次布局（默认 `applyCentered()`）。

```ts
watch([vw, vh], () => {
  if (maximize.value) applyMaximized()
  else if (minimize.value) applyMinimized(...)
  else if (isMobile.value) applyMaximized()   // 小屏铺满
  else clampToViewport()
})
```

`windowMinimize/windowResize/windowMaximize` 内部改为调用上述布局函数，移除其中的
`useWindowSize()` 重复调用与散落赋值，逻辑收敛、可测试。

### 4. 最小化排列（多窗口任务条）

在 `ModalManager` 中增加最小化登记（单例天然适合做跨实例协调）：

```ts
private minimizedKeys = ref<ModalKey[]>([])
registerMinimized(key)        // 不在列表则追加
unregisterMinimized(key)      // 从列表移除（其余自动重排）
getMinimizedKeys(): ModalKey[]// 返回响应式数组
getMinimizedIndex(key): number// 返回 key 在列表中的下标
```

`YlModal` 新增可选 prop `modalKey?: ModalKey`（由 Host 传入 `modalEntry.key`）。最小化时
`Modal.registerMinimized(modalKey)`；恢复时 `Modal.unregisterMinimized(modalKey)`；
`onBeforeUnmount` 中若处于最小化则取消登记，避免残留。

`YlModal` 通过 `watch([() => minimize.value, () => Modal.getMinimizedKeys().length])` 在最小化态
变化时调用 `applyMinimized(index, total)` 重排自身位置；其他最小化窗口因共享响应式列表也会
同步重排。`modalKey` 缺省（声明式无 key）时按 `index = 0` 处理，沿用原左下角单点行为，不破坏
既有声明式示例。

### 5. 移动端触控适配

- 头部按钮容器、`.modal-body`、`.modal-footer` 在既有 `@mousedown.stop` 基础上追加
  `@touchstart.stop`，使触屏点按不触发拖拽、内容区可正常触屏滚动。
- `localDraggable/localResizable` 在 `isMobile` 与 `maximize` 下置否（见 §1），避免小屏误拖拽。
- 小屏正常态走 `applyMaximized()` 铺满视口，保证内容可见与可滚动。
- 保留 `vue3-draggable-resizable` 自带的 `touchstart/touchmove` 触控拖拽（库已支持），
  桌面与触屏拖拽共用同一套事件链路；不引入额外手势库。

### 6. Host 传 key 与类型补充

`YlModalHost.vue` 在 `h(YlModal, {...})` 中追加 `modalKey: modalEntry.key`。

向 `src/types/components/modal.d.ts` 的 `ModalManagerInterface` 增补
`registerMinimized/unregisterMinimized/getMinimizedKeys/getMinimizedIndex` 四个方法签名，
保持类型完整（与 AGENTS.md“新增公共 API 先补完整类型”一致）。

## 接口兼容性

- 不修改 `ModalOptions` 字段、`ModalInstance`、打开/关闭/隐藏语义与重复 key 行为。
- 不修改 `visible`/`show` 的传递方式（仍由 Host 从 `modalEntry` 传入，已响应式）。
- 新增 `YlModal` 的 `modalKey` prop 为可选，不影响现有声明式用法。
- 不新增依赖；`vue3-draggable-resizable` 仅使用已有 prop/事件能力。
- 默认尺寸仍基于 `900 x 560` 的“偏好尺寸”，仅做视口收敛，不新增 width/height 选项。

## 新增 / 修改文件清单

修改：

- `src/components/Modal/YlModal.vue` —— props 响应式派生、统一视口、布局函数、resize 监听、
  最小化排列、触控 `touchstart` 阻止、移动端禁用拖拽/缩放。
- `src/utils/modal-manager.ts` —— 最小化登记（响应式 `minimizedKeys` 及四个方法）。
- `src/components/Modal/YlModalHost.vue` —— 向 `YlModal` 传入 `modalKey`。
- `src/types/components/modal.d.ts` —— `ModalManagerInterface` 增补最小化登记方法。
- `TODO.md` —— 将该 TODO 项链接至本计划文档。

## 风险

- **resize 重排干扰拖拽位置**：正常态采用“仅约束不强行居中”的 `clampToViewport`，
  避免每次 resize 把用户拖好的窗口拉回中心。
- **最小化排列跨实例耦合**：依赖单例 `minimizedKeys` 响应式数组；某窗口恢复/关闭会触发其余
  最小化窗口 `watch` 重排，属预期行为。
- **声明式无 key**：无 `modalKey` 时最小化仍落左下角单点（沿用现状），不在本任务范围内改为
  全局任务条，以避免影响既有声明式示例。
- **小屏铺满与可滚动**：小屏 `applyMaximized()` 后内容通过 `.modal-body { overflow-y:auto }`
  滚动，需确认头部/底部固定、内容区可滚动。
- **测试覆盖**：须手工覆盖 AGENTS.md 列出的 Modal 测试项（声明式/API/重复 key/隐藏重显/
  关闭全部/遮罩点击/footer 事件/最小化恢复/最大化恢复/内容组件 expose/Router·Pinia·provide·
  全局属性），确认本次重构未破坏。

## 验收与验证方式

1. `pnpm run type-check` 通过（新增方法签名与 `modalKey` prop 类型正确，避免 `any`）。
2. `pnpm run lint` 通过且默认不修改文件。
3. `pnpm run build-only` 成功（仅可能沿用既有 ECharts ~562 kB 基线告警）。
4. 手工验证（`pnpm run dev`）：
   - 声明式示例中切换 `showFooter`，页脚实时隐藏/显示（验证 props 同步）。
   - 打开可拖拽窗口后缩放浏览器窗口，窗口保持可见、不溢出、不被推离视口。
   - 小屏（DevTools 设备模拟 < 640px）下窗口铺满且内容可滚动。
   - 连续打开并最小化多个 API 窗口，底部呈等距排列而非重叠；恢复其中一个，其余自动重排。
   - 移动端模拟下点按最小化/最大化/关闭按钮不误触发拖拽；内容区可触屏滚动。
   - 回归：重复 key 只恢复不重建、遮罩点击关闭、footer 自定义事件、内容组件 expose 调用、
     Router/Pinia/provide/全局属性访问均正常。

## 相关 TODO 处理

- 对应 `TODO.md` 中项“让 Modal props 与内部状态保持同步，并补充窗口 resize、超小视口、
  最小化排列及移动端触控适配”，实现完成后将该项标记为 `[X]` 并保留本计划文档链接。

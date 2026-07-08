# 路由级错误页、404 页面与异步加载失败处理

## 目标与范围

在现有 Vue Router 演示站中补齐三类“页面级兜底”能力，使未知路由、路由组件运行时异常、
以及异步 chunk 加载失败都拥有可控、可验证的展示与恢复路径：

1. **404 页面**：未匹配的路由渲染独立全屏错误页，并引导回首页。
2. **路由级错误页**：捕获路由组件在渲染阶段抛出的同步异常，展示错误页而非白屏，
   并提供“重试 / 返回首页”能力。
3. **异步页面加载失败处理**：对 `() => import(...)` 懒加载失败（网络中断、chunk 丢失等）
   进行自动重试，并在重试耗尽后展示可手动重试的错误组件。

本任务只新增与路由兜底相关的页面/组件/装配，不改动现有任何业务演示页（图标、布局、Modal、
按钮、ECharts、拖拽、代码块、关于）的实现逻辑，不改动 `DocLayout` 与 `ComponentsDocView`，
不引入新依赖。

## 现状问题

当前 `src/router/index.ts` 仅存在 `/`（重定向至 `/components`）与 `/components` 子路由，
`src/App.vue` 直接渲染 `<RouterView />` 与 `<YlModalHost />`。存在以下缺口：

1. 访问任何未定义路径（如 `/not-exist`）会因无匹配路由而停留在当前页或空白，
   没有统一的 404 展示。
2. 路由组件在 `setup`/`render` 阶段抛出异常时会冒泡导致整页白屏，没有错误边界兜底。
3. 懒加载组件使用裸 `() => import(...)`，加载失败时（开发态 HMR 异常或生产 chunk 404）
   直接报错且无重试/恢复入口。

## 推荐方案

### 1. 异步加载封装（`src/router/load-view.ts`）

新增 `loadView(loader: () => Promise<unknown>)` 工具，内部基于 `defineAsyncComponent`：

- `loadingComponent`：`AsyncLoading.vue`，`delay: 200` 后展示加载占位，避免闪烁。
- `errorComponent`：`AsyncError.vue`，Vue 会向该组件传入 `error`、`retry`、`attempts` 三个 prop。
- `timeout: 10000`：加载超时后进入失败分支。
- `onError(error, retry, fail, attempts)`：当偶发加载错误（如 chunk fetch 失败）时，
  在 `attempts <= 2` 时调用 `retry()` 自动重试，超出后 `fail()` 渲染 `AsyncError` 供用户手动重试。

`AsyncError.vue` 接收 `error`/`retry`/`attempts` prop，展示失败原因与“重试”按钮；
点击调用 `retry()` 重新触发 `loader`。

### 2. 404 页面（`src/views/error/NotFoundView.vue`）

独立全屏页面（不嵌套 `DocLayout`）。顶部放置醒目 404 标识、简短说明与“返回首页”链接
（`<RouterLink to="/">`）。样式复用与 `DocLayout` 一致的色值（`--doc-accent: #1677ff` 等），
但色值在使用处局部声明，避免依赖 scoped 变量。

路由改造（`src/router/index.ts`）：

- 在 routes 顶层追加 catch-all：
  ```ts
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { title: '页面未找到' }
  }
  ```
- 该 catch-all 置于 routes 末尾，不影响既有 `/components` 匹配。

### 3. 路由级错误边界（`src/components/error/ErrorBoundary.vue`）

使用 `onErrorCaptured` 捕获后代（即 `<RouterView>` 渲染的路由组件）渲染期异常：

- 默认渲染具名/默认插槽内的 `<RouterView>`。
- 捕获到错误时设置 `error` ref，渲染 `RouteErrorView` 替代插槽内容，并返回 `false` 阻止继续冒泡。
- 提供“重试”按钮：清空 `error` 后通过 `router.go(0)` 重新加载当前路由组件；
  “返回首页”按钮使用 `RouterLink` 跳转 `/`。

`RouteErrorView.vue`（`src/views/error/RouteErrorView.vue`）接收 `error: unknown` prop，
展示错误类型/信息（仅展示 `error.message`，不展开内部堆栈到用户态，避免泄露实现细节），
并提供重试/返回操作。

装配（`src/App.vue`）：

```vue
<ErrorBoundary>
  <RouterView />
</ErrorBoundary>
<YlModalHost />
```

`YlModalHost` 保持在 `ErrorBoundary` 之外，确保错误边界卸载路由内容时 Host 不被连带卸载，
满足 AGENTS.md 中“Host 不能随路由页面切换而卸载”的约束。

### 4. 路由表改造（`src/router/index.ts`）

将现有所有 `() => import(...)` 改为 `loadView(() => import(...))`，
使懒加载统一具备加载占位与失败重试能力。catch-all 的 404 组件保持裸 `import`（它无需加载占位，
但为一致性也可包裹 `loadView`，本方案选择保持裸 import 以简化首屏兜底）。

## 接口兼容性

- 不修改任何现有路由 `name`、`path`、`meta`，不影响导航与已知链接。
- 不新增公共 API、组件 props（除本任务新增文件自身的 props）或环境变量。
- `App.vue` 仍只装配一个 `YlModalHost`，且位于 `RouterView` 之外。
- 不改动 `main.ts` 插件注册顺序与现有装配。

## 新增 / 修改文件清单

新增：

- `src/router/load-view.ts` —— 异步加载封装。
- `src/components/error/ErrorBoundary.vue` —— 错误边界。
- `src/components/error/AsyncLoading.vue` —— 加载占位。
- `src/components/error/AsyncError.vue` —— 异步加载失败 + 重试。
- `src/views/error/NotFoundView.vue` —— 404 页面。
- `src/views/error/RouteErrorView.vue` —— 路由级错误页。

修改：

- `src/router/index.ts` —— 包裹 `loadView`、追加 catch-all 404 路由。
- `src/App.vue` —— 用 `ErrorBoundary` 包裹 `<RouterView />`。
- `TODO.md` —— 将该 TODO 项链接至本计划文档。

## 风险

- **错误边界作用域**：`onErrorCaptured` 仅捕获渲染/生命周期阶段同步异常；异步 loader 失败
  由 `defineAsyncComponent` 先行接管（展示 `AsyncError`），二者互补不冲突。
- **重试副作用**：`onErrorCaptured` 返回 `false` 仅阻止冒泡，不会吞掉 HMR 报错日志，
  开发态仍可看到原始错误。
- **404 与已知路径**：catch-all 必须放在 routes 末尾，否则会抢占 `/components` 等既有匹配。
- **样式一致性**：错误页为独立全屏页，需本地声明设计色值以对齐 `DocLayout` 视觉，避免引入
  对 scoped 变量的隐式依赖。

## 验收与验证方式

1. `pnpm run type-check` 通过（新增文件需补全 props 类型，避免 `any`）。
2. `pnpm run lint` 通过且默认不修改文件。
3. `pnpm run build-only` 成功（本任务不处理 ECharts 既有 ~562 kB chunk 警告，
   若构建仅因该基线问题告警，报告中需明确区分既有失败与新失败）。
4. 手工验证（开发服务器 `pnpm run dev`）：
   - 访问 `/not-exist` 等任意未定义路径，展示 404 页面且“返回首页”可跳转。
   - 在某路由组件 `setup` 中临时 `throw new Error('demo')`，导航至该路由，
     应展示路由级错误页而非白屏，且“重试”可恢复、“返回首页”可跳转。
   - 验证 `loadView` 装配：临时将某 `import` 路径改错后再改回，确认加载占位与重试链路
     编译通过（真实 chunk 失败难以稳定复现，以编译/类型校验为主）。
5. 确认 `YlModalHost` 仍独立于错误边界，未因本次改造被嵌套或卸载。

## 相关 TODO 处理

- 对应 `TODO.md` 低优先级项“增加路由级错误页、404 页面和异步页面加载失败处理”，
  实现完成后将该项标记为 `[X]` 并保留本计划文档链接。
